import { Router } from 'express';
import { partsController } from '../controllers/parts.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * Spare Parts routes
 */

// GET /api/parts/search - Search parts (must be before /:id to avoid conflicts)
router.get('/search', authMiddleware, (req, res) => 
  partsController.searchParts(req, res)
);

// GET /api/parts/low-stock - Get low stock parts (admin only)
router.get('/low-stock', authMiddleware, requireAdmin, (req, res) => 
  partsController.getLowStockParts(req, res)
);

// GET /api/parts - Get all spare parts
router.get('/', authMiddleware, (req, res) => 
  partsController.getAllParts(req, res)
);

// GET /api/parts/:id - Get spare part by ID
router.get('/:id', authMiddleware, (req, res) => 
  partsController.getPartById(req, res)
);

// POST /api/parts - Create spare part (admin only)
router.post('/', authMiddleware, requireAdmin, (req, res) => 
  partsController.createPart(req, res)
);

// PUT /api/parts/:id - Update spare part (admin only)
router.put('/:id', authMiddleware, requireAdmin, (req, res) => 
  partsController.updatePart(req, res)
);

// DELETE /api/parts/:id - Delete spare part (admin only)
router.delete('/:id', authMiddleware, requireAdmin, (req, res) => 
  partsController.deletePart(req, res)
);

export default router;
