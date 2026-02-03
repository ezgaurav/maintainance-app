import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { issueService } from '../services/issue.service';
import { z } from 'zod';

// Validation schemas
const createIssueSchema = z.object({
  appliance_type: z.string().min(2),
  brand: z.string().optional(),
  model: z.string().optional(),
  issue_description: z.string().min(10),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  images: z.array(z.string()).optional(),
  address: z.string().min(5),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

const rateIssueSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().optional()
});

class IssueController {
  /**
   * Create new issue
   * POST /api/issues
   */
  async createIssue(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = createIssueSchema.parse(req.body);
      const issue = await issueService.createIssue(req.user.userId, validatedData);
      res.status(201).json(issue);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get customer's issues
   * GET /api/issues/my
   */
  async getMyIssues(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const issues = await issueService.getCustomerIssues(req.user.userId);
      res.json(issues);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get issue by ID
   * GET /api/issues/:id
   */
  async getIssueById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const issue = await issueService.getIssueById(id);
      res.json(issue);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  /**
   * Rate completed issue
   * POST /api/issues/:id/rate
   */
  async rateIssue(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const validatedData = rateIssueSchema.parse(req.body);
      
      const issue = await issueService.rateJob(
        id,
        req.user.userId,
        validatedData.rating,
        validatedData.comment
      );
      
      res.json(issue);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Cancel issue
   * POST /api/issues/:id/cancel
   */
  async cancelIssue(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const issue = await issueService.cancelIssue(id, req.user.userId);
      res.json(issue);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const issueController = new IssueController();
