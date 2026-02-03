import { useEffect } from 'react';
import { socketService } from '../services/socket.service';
import { useAuthStore, useNotificationStore } from '../store';
import { SOCKET_EVENTS } from '../utils/constants';
import { Notification } from '../types';

export const useSocket = () => {
  const { user, token } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!token || !user) return;

    socketService.connect(token);

    socketService.on(SOCKET_EVENTS.NEW_NOTIFICATION, (notification: Notification) => {
      addNotification(notification);
      
      if (Notification && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/vite.svg',
        });
      }
    });

    socketService.on(SOCKET_EVENTS.NEW_ISSUE, (data: any) => {
      if (user.role === 'technician' || user.role === 'admin') {
        console.log('New issue created:', data);
      }
    });

    socketService.on(SOCKET_EVENTS.ISSUE_ASSIGNED, (data: any) => {
      console.log('Issue assigned:', data);
    });

    socketService.on(SOCKET_EVENTS.ISSUE_ACCEPTED, (data: any) => {
      console.log('Issue accepted:', data);
    });

    socketService.on(SOCKET_EVENTS.ISSUE_REJECTED, (data: any) => {
      console.log('Issue rejected:', data);
    });

    socketService.on(SOCKET_EVENTS.ISSUE_COMPLETED, (data: any) => {
      console.log('Issue completed:', data);
    });

    socketService.on(SOCKET_EVENTS.TECHNICIAN_VERIFIED, (data: any) => {
      console.log('Technician verified:', data);
    });

    socketService.on(SOCKET_EVENTS.ORDER_STATUS_UPDATED, (data: any) => {
      console.log('Order status updated:', data);
    });

    return () => {
      socketService.disconnect();
    };
  }, [token, user, addNotification]);

  return socketService;
};
