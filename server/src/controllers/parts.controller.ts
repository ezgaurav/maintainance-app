import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { partsService } from '../services/parts.service';
import { z } from 'zod';

// Validation schemas
const createPartSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.enum(['HA', 'SHA', 'Tool', 'Maintenance', 'Accessory']),
  price: z.number().positive(),
  stock: z.number().int().min(0),
  low_stock_threshold: z.number().int().min(0).optional(),
  image: z.string().optional()
});

const updatePartSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  category: z.enum(['HA', 'SHA', 'Tool', 'Maintenance', 'Accessory']).optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0).optional(),
  low_stock_threshold: z.number().int().min(0).optional(),
  image: z.string().optional()
});

class PartsController {
  /**
   * Get all spare parts
   * GET /api/parts
   */
  async getAllParts(req: AuthRequest, res: Response) {
    try {
      const { category, inStock } = req.query;
      const filters: any = {};
      
      if (category) filters.category = category as string;
      if (inStock) filters.inStock = inStock === 'true';

      const parts = await partsService.getAllParts(filters);
      res.json(parts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get spare part by ID
   * GET /api/parts/:id
   */
  async getPartById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const part = await partsService.getPartById(id);
      res.json(part);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Create spare part (admin only)
   * POST /api/parts
   */
  async createPart(req: AuthRequest, res: Response) {
    try {
      const validatedData = createPartSchema.parse(req.body);
      const part = await partsService.createPart(validatedData);
      res.status(201).json(part);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update spare part (admin only)
   * PUT /api/parts/:id
   */
  async updatePart(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updatePartSchema.parse(req.body);
      const part = await partsService.updatePart(id, validatedData);
      res.json(part);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete spare part (admin only)
   * DELETE /api/parts/:id
   */
  async deletePart(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await partsService.deletePart(id);
      res.json({ success: true, message: 'Part deleted successfully' });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get low stock parts (admin only)
   * GET /api/parts/low-stock
   */
  async getLowStockParts(_req: AuthRequest, res: Response) {
    try {
      const parts = await partsService.getLowStockParts();
      res.json(parts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Search parts
   * GET /api/parts/search
   */
  async searchParts(req: AuthRequest, res: Response) {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const parts = await partsService.searchParts(q);
      res.json(parts);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const partsController = new PartsController();
