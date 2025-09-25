import { useState, useCallback } from 'react';

let toastId = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message = '', duration = 5000) => {
    const id = ++toastId;
    const toast = {
      id,
      type,
      title,
      message,
      duration
    };

    setToasts(prev => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((title, message = '') => {
    return addToast('success', title, message);
  }, [addToast]);

  const showError = useCallback((title, message = '') => {
    return addToast('error', title, message, 7000); // Longer duration for errors
  }, [addToast]);

  const showWarning = useCallback((title, message = '') => {
    return addToast('warning', title, message);
  }, [addToast]);

  const showInfo = useCallback((title, message = '') => {
    return addToast('info', title, message);
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};