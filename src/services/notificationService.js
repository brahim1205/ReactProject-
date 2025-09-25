import api from './api.js';

class NotificationService {
  async getUserNotifications(userId, limit = 50) {
    try {
      const response = await api.get(`/notifications/users/${userId}?limit=${limit}`);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors de la récupération des notifications' };
    }
  }

  async getUnreadCount(userId) {
    try {
      const response = await api.get(`/notifications/users/${userId}/unread-count`);
      return response.data.success ? response.data.data.count : response.data.count;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du comptage des notifications' };
    }
  }

  async markAsRead(notificationId, userId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`, { userId });
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du marquage de la notification' };
    }
  }

  async markAllAsRead(userId) {
    try {
      const response = await api.patch(`/notifications/users/${userId}/read-all`);
      return response.data.success ? response.data.data : response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur lors du marquage des notifications' };
    }
  }
}

export const notificationService = new NotificationService();