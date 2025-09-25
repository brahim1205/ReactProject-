import { PrismaClient } from '@prisma/client';
import { NotificationService } from './NotificationService';

export class ScheduledTaskService {
  constructor(private prisma: PrismaClient, private notificationService: NotificationService) {}

  /**
   * Met à jour automatiquement les statuts des tâches planifiées
   */
  async updateScheduledTaskStatuses(): Promise<void> {
    const now = new Date();

    try {
      console.log('🔄 Vérification des tâches planifiées...');

      // 1. Tâches en attente dont l'heure de début est arrivée → en cours
      const tasksToStart = await this.prisma.todo.findMany({
        where: {
          status: 'pending',
          startDateTime: {
            lte: now
          },
          endDateTime: {
            gt: now // S'assurer que ce n'est pas déjà terminé
          }
        }
      });

      if (tasksToStart.length > 0) {
        await this.prisma.todo.updateMany({
          where: {
            id: { in: tasksToStart.map(t => t.id) }
          },
          data: {
            status: 'in_progress'
          }
        });
        console.log(`✅ ${tasksToStart.length} tâche(s) passée(s) en cours`);
      }

      // 2. Tâches en cours dont l'heure de fin est arrivée → terminée
      const tasksToComplete = await this.prisma.todo.findMany({
        where: {
          status: 'in_progress',
          endDateTime: {
            lte: now
          }
        }
      });

      if (tasksToComplete.length > 0) {
        // Mettre à jour les tâches
        await this.prisma.todo.updateMany({
          where: {
            id: { in: tasksToComplete.map(t => t.id) }
          },
          data: {
            status: 'completed',
            completedAt: now
          }
        });

        // Créer des notifications pour les propriétaires
        for (const task of tasksToComplete) {
          await this.prisma.notification.create({
            data: {
              type: 'task_reminder',
              title: 'Tâche terminée automatiquement',
              message: `Votre tâche "${task.title}" a été terminée automatiquement car l'heure de fin planifiée est arrivée.`,
              recipientId: task.userId,
              todoId: task.id,
              todoTitle: task.title
            }
          });
        }

        console.log(`✅ ${tasksToComplete.length} tâche(s) terminée(s) automatiquement`);
      }

      // 3. Tâches planifiées dont l'heure de fin est dépassée sans être passées en cours → terminée
      const overdueTasks = await this.prisma.todo.findMany({
        where: {
          status: 'pending',
          endDateTime: {
            lte: now
          }
        }
      });

      if (overdueTasks.length > 0) {
        await this.prisma.todo.updateMany({
          where: {
            id: { in: overdueTasks.map(t => t.id) }
          },
          data: {
            status: 'completed',
            completedAt: now
          }
        });
        console.log(`⚠️ ${overdueTasks.length} tâche(s) en retard terminée(s)`);
      }

      // 4. Tâches qui expirent dans exactement 2 minutes et n'ont pas encore reçu de notification
      const twoMinutesFromNow = new Date(now.getTime() + 2 * 60 * 1000);
      const tasksExpiringSoon = await this.prisma.todo.findMany({
        where: {
          status: { in: ['pending', 'in_progress'] },
          endDateTime: {
            gte: now,
            lte: twoMinutesFromNow
          },
          expirationWarningSent: false
        }
      });

      if (tasksExpiringSoon.length > 0) {
        // Marquer les tâches comme ayant reçu la notification
        await this.prisma.todo.updateMany({
          where: {
            id: { in: tasksExpiringSoon.map(t => t.id) }
          },
          data: {
            expirationWarningSent: true
          }
        });

        // Envoyer des notifications
        for (const task of tasksExpiringSoon) {
          await this.notificationService.notifyTaskExpiringSoon(task.id, task.title, task.userId);
        }

        console.log(`🔔 ${tasksExpiringSoon.length} notification(s) d'expiration envoyée(s)`);
      }

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des statuts:', error);
    }
  }

  /**
   * Récupère les statistiques des tâches planifiées
   */
  async getScheduledTasksStats() {
    const [
      pendingCount,
      inProgressCount,
      completedCount,
      overdueCount
    ] = await Promise.all([
      this.prisma.todo.count({
        where: {
          status: 'pending',
          startDateTime: { not: null }
        }
      }),
      this.prisma.todo.count({
        where: {
          status: 'in_progress',
          startDateTime: { not: null }
        }
      }),
      this.prisma.todo.count({
        where: {
          status: 'completed',
          startDateTime: { not: null }
        }
      }),
      this.prisma.todo.count({
        where: {
          status: 'pending',
          endDateTime: { lte: new Date() }
        }
      })
    ]);

    return {
      pending: pendingCount,
      inProgress: inProgressCount,
      completed: completedCount,
      overdue: overdueCount
    };
  }
}

export default ScheduledTaskService;