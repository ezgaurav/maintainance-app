import { Router } from 'express';
import { notificationController } from '../controllers/notification.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * Notification routes
 * All routes require authentication
 */

router.use(authMiddleware);

// GET /api/notifications/unread-count - Get unread notification count
router.get('/unread-count', (req, res) => 
  notificationController.getUnreadCount(req, res)
);

// POST /api/notifications/read-all - Mark all notifications as read
router.post('/read-all', (req, res) => 
  notificationController.markAllAsRead(req, res)
);

// GET /api/notifications - Get user notifications
router.get('/', (req, res) => 
  notificationController.getNotifications(req, res)
);

// POST /api/notifications/:id/read - Mark notification as read
router.post('/:id/read', (req, res) => 
  notificationController.markAsRead(req, res)
);

export default router;
