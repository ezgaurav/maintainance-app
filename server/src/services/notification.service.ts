import { supabase } from '../config/supabase';
import { emitToUser } from '../config/socket';

class NotificationService {
  /**
   * Create a new notification
   */
  async create(data: {
    user_id: string;
    type: string;
    title: string;
    message?: string;
    data?: any;
  }) {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create notification: ' + error.message);
    }

    // Emit real-time notification
    emitToUser(data.user_id, 'new-notification', notification);

    return notification;
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error('Failed to fetch notifications: ' + error.message);
    }

    return data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) {
      throw new Error('Failed to mark notification as read: ' + error.message);
    }

    return { success: true };
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw new Error('Failed to mark notifications as read: ' + error.message);
    }

    return { success: true };
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) {
      throw new Error('Failed to get unread count: ' + error.message);
    }

    return count || 0;
  }
}

export const notificationService = new NotificationService();
