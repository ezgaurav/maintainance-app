import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { issueService } from '../services/issue.service';
import { technicianService } from '../services/technician.service';
import { z } from 'zod';

// Validation schemas
const scheduleJobSchema = z.object({
  scheduled_date: z.string(),
  scheduled_time: z.string()
});

const completeJobSchema = z.object({
  completion_summary: z.string().min(20),
  completion_photos: z.array(z.string()).min(3),
  completion_video: z.string().optional(),
  completion_audio: z.string().optional(),
  final_cost: z.number().positive()
});

const updateProfileSchema = z.object({
  skills: z.array(z.string()).optional(),
  working_areas: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

class TechnicianController {
  /**
   * Get technician's jobs
   * GET /api/technician/jobs
   */
  async getJobs(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const jobs = await issueService.getTechnicianJobs(req.user.userId);
      res.json(jobs);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Accept job
   * POST /api/technician/jobs/:id/accept
   */
  async acceptJob(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const job = await issueService.acceptJob(id, req.user.userId);
      res.json(job);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Reject job
   * POST /api/technician/jobs/:id/reject
   */
  async rejectJob(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const result = await issueService.rejectJob(id, req.user.userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Schedule job
   * POST /api/technician/jobs/:id/schedule
   */
  async scheduleJob(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const validatedData = scheduleJobSchema.parse(req.body);
      
      const job = await issueService.scheduleJob(
        id,
        req.user.userId,
        validatedData.scheduled_date,
        validatedData.scheduled_time
      );
      
      res.json(job);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Complete job
   * POST /api/technician/jobs/:id/complete
   */
  async completeJob(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const validatedData = completeJobSchema.parse(req.body);
      
      const job = await issueService.completeJob(id, req.user.userId, validatedData);
      res.json(job);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get technician profile
   * GET /api/technician/profile
   */
  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const profile = await technicianService.getTechnicianProfile(req.user.userId);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update technician profile
   * PUT /api/technician/profile
   */
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const validatedData = updateProfileSchema.parse(req.body);
      const profile = await technicianService.updateProfile(req.user.userId, validatedData);
      res.json(profile);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get technician statistics
   * GET /api/technician/stats
   */
  async getStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const stats = await technicianService.getTechnicianStats(req.user.userId);
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const technicianController = new TechnicianController();
