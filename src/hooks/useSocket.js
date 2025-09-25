import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './useAuth.js';
import { useNotifications } from './useNotifications.js';
import { useToastContext } from '../contexts/ToastContext.jsx';

export const useSocket = () => {
  const { isAuthenticated, user } = useAuth();
  const { loadNotifications, loadUnreadCount } = useNotifications(user?.id);
  const { showInfo } = useToastContext();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      // Récupérer le token depuis localStorage
      const token = localStorage.getItem('token');

      if (token) {
        // Créer la connexion Socket.IO
        socketRef.current = io('http://localhost:3011', {
          auth: {
            token: token
          }
        });

        // Écouter les événements de connexion
        socketRef.current.on('connect', () => {
          console.log('Connected to WebSocket server');
          setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
          console.log('Disconnected from WebSocket server');
          setIsConnected(false);
        });

        // Écouter les notifications en temps réel
        socketRef.current.on('notification', (notification) => {
          console.log('Received real-time notification:', notification);

          // Recharger les notifications et le compteur
          loadNotifications();
          loadUnreadCount();

          // Afficher une notification toast
          showInfo(`Nouvelle notification: ${notification.title}`);
        });

        // Gérer les erreurs
        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
        });
      }
    }

    // Nettoyer la connexion lors du démontage ou changement d'utilisateur
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, user?.id, loadNotifications, loadUnreadCount]);

  return {
    socket: socketRef.current,
    isConnected
  };
};