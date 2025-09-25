import { ScheduledTaskService } from './ScheduledTaskService';
import { NotificationService } from './NotificationService';
import { PrismaClient } from '@prisma/client';

export class ScheduledTaskUpdater {
  private scheduledTaskService: ScheduledTaskService;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;

  constructor(private prisma: PrismaClient, private notificationService: NotificationService) {
    this.scheduledTaskService = new ScheduledTaskService(prisma, notificationService);
  }

  /**
   * Démarre la mise à jour périodique des tâches planifiées
   * @param intervalMinutes Intervalle en minutes (défaut: 1 minute)
   */
  start(intervalMinutes: number = 1): void {
    if (this.isRunning) {
      console.log('🔄 ScheduledTaskUpdater déjà en cours d\'exécution');
      return;
    }

    this.isRunning = true;
    const intervalMs = intervalMinutes * 60 * 1000;

    console.log(`🚀 Démarrage de ScheduledTaskUpdater (intervalle: ${intervalMinutes}min)`);

    // Exécute immédiatement une première fois
    this.updateStatuses();

    // Puis configure l'intervalle
    this.intervalId = setInterval(() => {
      this.updateStatuses();
    }, intervalMs);
  }

  /**
   * Arrête la mise à jour périodique
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isRunning = false;
      console.log('⏹️ ScheduledTaskUpdater arrêté');
    }
  }

  /**
   * Met à jour manuellement les statuts des tâches planifiées
   */
  async updateStatuses(): Promise<void> {
    try {
      console.log('🔄 Vérification des tâches planifiées...');
      await this.scheduledTaskService.updateScheduledTaskStatuses();

      // Afficher les statistiques
      const stats = await this.scheduledTaskService.getScheduledTasksStats();
      console.log('📊 Statistiques des tâches planifiées:', stats);

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour des statuts:', error);
    }
  }

  /**
   * Vérifie si le service est en cours d'exécution
   */
  isActive(): boolean {
    return this.isRunning;
  }
}

// Instance globale pour l'application
let globalUpdater: ScheduledTaskUpdater | null = null;

/**
 * Fonction utilitaire pour démarrer le service de mise à jour
 */
export function startScheduledTaskUpdater(prisma: PrismaClient, notificationService: NotificationService, intervalMinutes: number = 1): ScheduledTaskUpdater {
  if (!globalUpdater) {
    globalUpdater = new ScheduledTaskUpdater(prisma, notificationService);
  }
  globalUpdater.start(intervalMinutes);
  return globalUpdater;
}

/**
 * Fonction utilitaire pour arrêter le service
 */
export function stopScheduledTaskUpdater(): void {
  if (globalUpdater) {
    globalUpdater.stop();
    globalUpdater = null;
  }
}

/**
 * Fonction utilitaire pour obtenir l'instance globale
 */
export function getScheduledTaskUpdater(): ScheduledTaskUpdater | null {
  return globalUpdater;
}

export default ScheduledTaskUpdater;