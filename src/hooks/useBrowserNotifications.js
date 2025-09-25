import { useEffect, useCallback } from 'react';

export const useBrowserNotifications = () => {
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Ce navigateur ne supporte pas les notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }, []);

  const showNotification = useCallback((title, options = {}) => {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/vite.svg', 
        badge: '/vite.svg',
        ...options
      });

      if (!options.requireInteraction) {
        setTimeout(() => {
          notification.close();
        }, 10000);
      }

      return notification;
    }
    return null;
  }, []);

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  return {
    requestPermission,
    showNotification,
    isSupported: 'Notification' in window,
    permission: Notification.permission
  };
};