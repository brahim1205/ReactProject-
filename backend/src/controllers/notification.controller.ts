import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';

// Classe utilitaire pour les réponses HTTP standardisées
class HttpResponse {
  static success<T>(res: Response, data: T, statusCode: number = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res: Response, message: string, statusCode: number = 500, error?: any) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      timestamp: new Date().toISOString()
    });
  }
}

export class NotificationController {
  constructor(private notificationService: NotificationService) {}

  async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId || '');
      if (isNaN(userId)) {
        return HttpResponse.error(res, 'ID utilisateur invalide', 400);
      }

      const limit = parseInt(req.query.limit as string) || 50;
      const notifications = await this.notificationService.getUserNotifications(userId, limit);

      return HttpResponse.success(res, notifications);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      return HttpResponse.error(res, 'Erreur lors de la récupération des notifications', 500, error);
    }
  }

  async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId || '');
      if (isNaN(userId)) {
        return HttpResponse.error(res, 'ID utilisateur invalide', 400);
      }

      const count = await this.notificationService.getUnreadCount(userId);

      return HttpResponse.success(res, { count });
    } catch (error) {
      console.error('Erreur lors du comptage des notifications:', error);
      return HttpResponse.error(res, 'Erreur lors du comptage des notifications', 500, error);
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      const notificationId = parseInt(req.params.id || '');
      const userId = parseInt(req.body.userId || '');

      if (isNaN(notificationId) || isNaN(userId)) {
        return HttpResponse.error(res, 'Paramètres invalides', 400);
      }

      await this.notificationService.markAsRead(notificationId, userId);

      return HttpResponse.success(res, { message: 'Notification marquée comme lue' });
    } catch (error) {
      console.error('Erreur lors du marquage de la notification:', error);
      return HttpResponse.error(res, 'Erreur lors du marquage de la notification', 500, error);
    }
  }

  async markAllAsRead(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId || '');
      if (isNaN(userId)) {
        return HttpResponse.error(res, 'ID utilisateur invalide', 400);
      }

      await this.notificationService.markAllAsRead(userId);

      return HttpResponse.success(res, { message: 'Toutes les notifications marquées comme lues' });
    } catch (error) {
      console.error('Erreur lors du marquage des notifications:', error);
      return HttpResponse.error(res, 'Erreur lors du marquage des notifications', 500, error);
    }
  }
}