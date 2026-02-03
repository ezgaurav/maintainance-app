import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * Admin routes
 * All routes require admin authentication
 */

// Apply admin middleware to all routes
router.use(authMiddleware, requireAdmin);

// GET /api/admin/dashboard - Get dashboard statistics
router.get('/dashboard', (req, res) => 
  adminController.getDashboardStats(req, res)
);

// GET /api/admin/issues - Get all issues
router.get('/issues', (req, res) => 
  adminController.getAllIssues(req, res)
);

// GET /api/admin/users - Get all users
router.get('/users', (req, res) => 
  adminController.getAllUsers(req, res)
);

// GET /api/admin/technicians - Get all technicians
router.get('/technicians', (req, res) => 
  adminController.getAllTechnicians(req, res)
);

// POST /api/admin/technicians/:id/verify - Verify technician
router.post('/technicians/:id/verify', (req, res) => 
  adminController.verifyTechnician(req, res)
);

// POST /api/admin/technicians/:id/block - Block/Update technician status
router.post('/technicians/:id/block', (req, res) => 
  adminController.updateTechnicianStatus(req, res)
);

// POST /api/admin/issues/:id/assign - Assign technician to issue
router.post('/issues/:id/assign', (req, res) => 
  adminController.assignTechnician(req, res)
);

// POST /api/admin/issues/:id/force-complete - Force complete issue
router.post('/issues/:id/force-complete', (req, res) => 
  adminController.forceCompleteIssue(req, res)
);

// GET /api/admin/find-technicians/:issueId - Find matching technicians for issue
router.get('/find-technicians/:issueId', (req, res) => 
  adminController.findTechniciansForIssue(req, res)
);

// GET /api/admin/complaints - Get all complaints
router.get('/complaints', (req, res) => 
  adminController.getAllComplaints(req, res)
);

// POST /api/admin/complaints/:id/resolve - Resolve complaint
router.post('/complaints/:id/resolve', (req, res) => 
  adminController.resolveComplaint(req, res)
);

export default router;
