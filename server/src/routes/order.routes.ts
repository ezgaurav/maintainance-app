import { Router } from 'express';
import { orderController } from '../controllers/order.controller';
import { authMiddleware, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * Order routes
 */

// Admin routes (place before user routes to avoid conflicts)
// PUT /api/orders/:id/status - Update order status (admin only)
router.put('/:id/status', authMiddleware, requireAdmin, (req, res) => 
  orderController.updateOrderStatus(req, res)
);

// User routes
// GET /api/orders/my - Get user's orders (must be before /:id to avoid conflicts)
router.get('/my', authMiddleware, (req, res) => 
  orderController.getMyOrders(req, res)
);

// POST /api/orders - Create new order
router.post('/', authMiddleware, (req, res) => 
  orderController.createOrder(req, res)
);

// GET /api/orders/:id - Get order by ID
router.get('/:id', authMiddleware, (req, res) => 
  orderController.getOrderById(req, res)
);

// POST /api/orders/:id/cancel - Cancel order
router.post('/:id/cancel', authMiddleware, (req, res) => 
  orderController.cancelOrder(req, res)
);

export default router;
