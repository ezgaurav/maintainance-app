import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { orderService } from '../services/order.service';
import { z } from 'zod';

// Validation schemas
const createOrderSchema = z.object({
  items: z.array(z.object({
    part_id: z.string().uuid(),
    quantity: z.number().int().positive(),
    price: z.number().positive().optional()
  })).min(1),
  shipping_address: z.string().min(10),
  payment_method: z.string()
});

class OrderController {
  /**
   * Create new order
   * POST /api/orders
   */
  async createOrder(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = createOrderSchema.parse(req.body);
      
      // Remove optional price from items before passing to service
      const orderData = {
        items: validatedData.items.map(({ part_id, quantity }) => ({ part_id, quantity })),
        shipping_address: validatedData.shipping_address,
        payment_method: validatedData.payment_method
      };
      
      const order = await orderService.createOrder(req.user.userId, orderData as any);
      res.status(201).json(order);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get user's orders
   * GET /api/orders/my
   */
  async getMyOrders(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const orders = await orderService.getUserOrders(req.user.userId);
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get order by ID
   * GET /api/orders/:id
   */
  async getOrderById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const order = await orderService.getOrderById(id);
      res.json(order);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Cancel order
   * POST /api/orders/:id/cancel
   */
  async cancelOrder(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const order = await orderService.cancelOrder(id, req.user.userId);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get all orders (admin only)
   * GET /api/orders
   */
  async getAllOrders(req: AuthRequest, res: Response) {
    try {
      const { status, payment_status } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status as string;
      if (payment_status) filters.payment_status = payment_status as string;

      const orders = await orderService.getAllOrders(filters);
      res.json(orders);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update order status (admin only)
   * PUT /api/orders/:id/status
   */
  async updateOrderStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const order = await orderService.updateOrderStatus(id, status);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const orderController = new OrderController();
