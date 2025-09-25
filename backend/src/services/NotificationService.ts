import { PrismaClient } from '@prisma/client';
import { sendNotification } from '../server';

export class NotificationService {
  constructor(private prisma: PrismaClient) {}


  async createNotification(data: {
    type: string;
    title: string;
    message: string;
    recipientId: number;
    senderId?: number | null;
    todoId?: number | null;
    todoTitle?: string | null;
  }) {
    const notification = await this.prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        recipientId: data.recipientId,
        senderId: data.senderId || null,
        todoId: data.todoId || null,
        todoTitle: data.todoTitle || null,
      },
    });

    sendNotification(data.recipientId, {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt,
      todoId: notification.todoId,
      todoTitle: notification.todoTitle,
    });

    return notification;
  }


  async getUserNotifications(userId: number, limit: number = 50) {
    return this.prisma.notification.findMany({
      where: { recipientId: userId },
      include: {
        sender: {
          select: { id: true, name: true, profileImageUrl: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }


  async markAsRead(notificationId: number, userId: number) {
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        recipientId: userId,
      },
      data: { isRead: true },
    });
  }

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   */
  async markAllAsRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { recipientId: userId },
      data: { isRead: true },
    });
  }


  async getUnreadCount(userId: number) {
    return this.prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  }

  async notifyTaskAssigned(todoId: number, todoTitle: string, senderId: number, recipientId: number) {
    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      select: { name: true },
    });

    return this.createNotification({
      type: 'task_assigned',
      title: 'Nouvelle tâche assignée',
      message: `${sender?.name || 'Quelqu\'un'} vous a assigné la tâche "${todoTitle}"`,
      recipientId,
      senderId,
      todoId,
      todoTitle,
    });
  }


  async notifyTaskCompleted(todoId: number, todoTitle: string, completerId: number, originalAssigneeId: number) {
    const completer = await this.prisma.user.findUnique({
      where: { id: completerId },
      select: { name: true },
    });

    return this.createNotification({
      type: 'task_completed',
      title: 'Tâche terminée',
      message: `${completer?.name || 'Quelqu\'un'} a terminé la tâche "${todoTitle}"`,
      recipientId: originalAssigneeId,
      senderId: completerId,
      todoId,
      todoTitle,
    });
  }


  async notifyTaskReminder(todoId: number, todoTitle: string, recipientId: number) {
    return this.createNotification({
      type: 'task_reminder',
      title: 'Rappel de tâche',
      message: `Rappel: La tâche "${todoTitle}" doit commencer bientôt`,
      recipientId,
      todoId,
      todoTitle,
    });
  }

  async notifyTaskExpiringSoon(todoId: number, todoTitle: string, recipientId: number) {
    return this.createNotification({
      type: 'task_expiring_soon',
      title: 'Tâche expire bientôt',
      message: `Votre tâche "${todoTitle}" expire dans 2 minutes`,
      recipientId,
      todoId,
      todoTitle,
    });
  }
}

export default NotificationService;