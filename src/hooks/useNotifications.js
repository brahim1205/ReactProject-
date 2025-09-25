import { useState, useEffect, useCallback } from 'react';
import { notificationService } from '../services/notificationService.js';

export const useNotifications = (userId) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNotifications = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await notificationService.getUserNotifications(userId);
      setNotifications(data);
    } catch (err) {
      setError(err.message);
      console.error('Erreur lors du chargement des notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const loadUnreadCount = useCallback(async () => {
    if (!userId) return;

    try {
      const count = await notificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (err) {
      console.error('Erreur lors du chargement du compteur:', err);
    }
  }, [userId]);

  const markAsRead = useCallback(async (notificationId) => {
    if (!userId) return;

    try {
      await notificationService.markAsRead(notificationId, userId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Erreur lors du marquage comme lu:', err);
    }
  }, [userId]);

  const markAllAsRead = useCallback(async () => {
    if (!userId) return;

    try {
      await notificationService.markAllAsRead(userId);
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (err) {
      console.error('Erreur lors du marquage de toutes les notifications:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [userId, loadNotifications, loadUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
    markAsRead,
    markAllAsRead,
  };
};