import { Router } from 'express';
import { issueController } from '../controllers/issue.controller';
import { authMiddleware, requireCustomer } from '../middleware/auth.middleware';

const router = Router();

/**
 * Issue routes (Customer)
 */

// POST /api/issues - Create new issue
router.post('/', authMiddleware, requireCustomer, (req, res) => 
  issueController.createIssue(req, res)
);

// GET /api/issues/my - Get customer's issues
router.get('/my', authMiddleware, requireCustomer, (req, res) => 
  issueController.getMyIssues(req, res)
);

// GET /api/issues/:id - Get issue by ID
router.get('/:id', authMiddleware, (req, res) => 
  issueController.getIssueById(req, res)
);

// POST /api/issues/:id/rate - Rate completed issue
router.post('/:id/rate', authMiddleware, requireCustomer, (req, res) => 
  issueController.rateIssue(req, res)
);

// POST /api/issues/:id/cancel - Cancel issue
router.post('/:id/cancel', authMiddleware, requireCustomer, (req, res) => 
  issueController.cancelIssue(req, res)
);

export default router;
