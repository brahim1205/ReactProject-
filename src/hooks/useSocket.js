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

  const playBellSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.type = 'sine';
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Erreur lors de la lecture du son:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const token = localStorage.getItem('token');

      if (token) {
        socketRef.current = io('http://localhost:3011', {
          auth: {
            token: token
          }
        });

        socketRef.current.on('connect', () => {
          console.log('Connected to WebSocket server');
          setIsConnected(true);
        });

        socketRef.current.on('disconnect', () => {
          console.log('Disconnected from WebSocket server');
          setIsConnected(false);
        });

        socketRef.current.on('notification', (notification) => {
          console.log('Received real-time notification:', notification);

          loadNotifications();
          loadUnreadCount();

          if (notification.type === 'task_expiring_soon') {
            playBellSound();
          }

          showInfo(`Nouvelle notification: ${notification.title}`);
        });

        socketRef.current.on('connect_error', (error) => {
          console.error('Socket connection error:', error);
          setIsConnected(false);
        });
      }
    }

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