import { useEffect, useCallback } from 'react';
import { useTodos } from './useTodos.js';
import { useNotifications } from './useNotifications.js';

export const useAutoRefresh = (user) => {
  const { loadData } = useTodos(user);
  const { loadNotifications, loadUnreadCount } = useNotifications(user?.id);

  const refreshData = useCallback(() => {
    if (user?.id) {
      console.log(' Actualisation automatique des données...');
      loadData();
      loadNotifications();
      loadUnreadCount();
    }
  }, [user?.id, loadData, loadNotifications, loadUnreadCount]);

  useEffect(() => {
    if (!user?.id) return;

    refreshData();

    const intervalId = setInterval(refreshData, 120000);

    return () => clearInterval(intervalId);
  }, [user?.id, refreshData]);

  return { refreshData };
};