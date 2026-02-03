import { Router } from 'express';
import { technicianController } from '../controllers/technician.controller';
import { authMiddleware, requireTechnician } from '../middleware/auth.middleware';

const router = Router();

/**
 * Technician routes
 */

// GET /api/technician/jobs - Get technician's assigned jobs
router.get('/jobs', authMiddleware, requireTechnician, (req, res) => 
  technicianController.getJobs(req, res)
);

// POST /api/technician/jobs/:id/accept - Accept job
router.post('/jobs/:id/accept', authMiddleware, requireTechnician, (req, res) => 
  technicianController.acceptJob(req, res)
);

// POST /api/technician/jobs/:id/reject - Reject job
router.post('/jobs/:id/reject', authMiddleware, requireTechnician, (req, res) => 
  technicianController.rejectJob(req, res)
);

// POST /api/technician/jobs/:id/schedule - Schedule job
router.post('/jobs/:id/schedule', authMiddleware, requireTechnician, (req, res) => 
  technicianController.scheduleJob(req, res)
);

// POST /api/technician/jobs/:id/complete - Complete job
router.post('/jobs/:id/complete', authMiddleware, requireTechnician, (req, res) => 
  technicianController.completeJob(req, res)
);

// GET /api/technician/profile - Get technician profile
router.get('/profile', authMiddleware, requireTechnician, (req, res) => 
  technicianController.getProfile(req, res)
);

// PUT /api/technician/profile - Update technician profile
router.put('/profile', authMiddleware, requireTechnician, (req, res) => 
  technicianController.updateProfile(req, res)
);

// GET /api/technician/stats - Get technician statistics
router.get('/stats', authMiddleware, requireTechnician, (req, res) => 
  technicianController.getStats(req, res)
);

export default router;
