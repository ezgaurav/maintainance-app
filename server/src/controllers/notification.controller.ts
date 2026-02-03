import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { notificationService } from '../services/notification.service';

class NotificationController {
  /**
   * Get user notifications
   * GET /api/notifications
   */
  async getNotifications(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { limit } = req.query;
      const notificationLimit = limit ? parseInt(limit as string) : 50;

      const notifications = await notificationService.getUserNotifications(
        req.user.userId,
        notificationLimit
      );
      
      res.json(notifications);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Mark notification as read
   * POST /api/notifications/:id/read
   */
  async markAsRead(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await notificationService.markAsRead(id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Mark all notifications as read
   * POST /api/notifications/read-all
   */
  async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      await notificationService.markAllAsRead(req.user.userId);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get unread notification count
   * GET /api/notifications/unread-count
   */
  async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const count = await notificationService.getUnreadCount(req.user.userId);
      res.json({ count });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const notificationController = new NotificationController();
