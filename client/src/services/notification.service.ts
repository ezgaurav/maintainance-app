import api from './api';
import type { Notification } from '../types';

export const notificationService = {
  // Get my notifications
  getMyNotifications: async (): Promise<Notification[]> => {
    const { data } = await api.get('/notifications');
    return data;
  },

  // Mark as read
  markAsRead: async (id: string): Promise<Notification> => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data;
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`);
  },
};
