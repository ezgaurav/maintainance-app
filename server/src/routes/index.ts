import { Router } from 'express';
import authRoutes from './auth.routes';
import issueRoutes from './issue.routes';
import technicianRoutes from './technician.routes';
import adminRoutes from './admin.routes';
import partsRoutes from './parts.routes';
import orderRoutes from './order.routes';
import notificationRoutes from './notification.routes';

const router = Router();

/**
 * Main API router
 * Combines all route modules
 */

router.use('/auth', authRoutes);
router.use('/issues', issueRoutes);
router.use('/technician', technicianRoutes);
router.use('/admin', adminRoutes);
router.use('/parts', partsRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'Home Appliance Maintenance API'
  });
});

export default router;
