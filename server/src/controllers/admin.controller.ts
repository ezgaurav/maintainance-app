import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { issueService } from '../services/issue.service';
import { technicianService } from '../services/technician.service';
import { adminService } from '../services/admin.service';
import { complaintService } from '../services/complaint.service';
import { z } from 'zod';

// Validation schemas
const assignTechnicianSchema = z.object({
  technician_id: z.string().uuid()
});

const forceCompleteSchema = z.object({
  reason: z.string().min(10)
});

const updateTechnicianStatusSchema = z.object({
  status: z.enum(['active', 'suspended', 'blocked']),
  reason: z.string().optional()
});

const resolveComplaintSchema = z.object({
  resolution: z.string().min(10)
});

class AdminController {
  /**
   * Get all issues
   * GET /api/admin/issues
   */
  async getAllIssues(req: AuthRequest, res: Response) {
    try {
      const { status, priority } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status as string;
      if (priority) filters.priority = priority as string;

      const issues = await issueService.getAllIssues(filters);
      res.json(issues);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get all users
   * GET /api/admin/users
   */
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const { role } = req.query;
      const filters: any = {};
      
      if (role) filters.role = role as string;

      const users = await adminService.getAllUsers(filters);
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get all technicians
   * GET /api/admin/technicians
   */
  async getAllTechnicians(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status as string;

      const technicians = await technicianService.getAllTechnicians(filters);
      res.json(technicians);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Verify technician
   * POST /api/admin/technicians/:id/verify
   */
  async verifyTechnician(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { id } = req.params;
      const technician = await technicianService.verifyTechnician(id, req.user.userId);
      res.json(technician);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Block/Update technician status
   * POST /api/admin/technicians/:id/block
   */
  async updateTechnicianStatus(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateTechnicianStatusSchema.parse(req.body);
      
      const technician = await technicianService.updateTechnicianStatus(
        id,
        validatedData.status,
        validatedData.reason
      );
      
      res.json(technician);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Assign technician to issue
   * POST /api/admin/issues/:id/assign
   */
  async assignTechnician(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = assignTechnicianSchema.parse(req.body);
      
      const issue = await issueService.assignTechnician(id, validatedData.technician_id);
      res.json(issue);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Force complete issue
   * POST /api/admin/issues/:id/force-complete
   */
  async forceCompleteIssue(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = forceCompleteSchema.parse(req.body);
      
      const issue = await issueService.forceCompleteJob(id, validatedData.reason);
      res.json(issue);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Find matching technicians for issue
   * GET /api/admin/find-technicians/:issueId
   */
  async findTechniciansForIssue(req: AuthRequest, res: Response) {
    try {
      const { issueId } = req.params;
      const technicians = await issueService.findMatchingTechnicians(issueId);
      res.json(technicians);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get all complaints
   * GET /api/admin/complaints
   */
  async getAllComplaints(req: AuthRequest, res: Response) {
    try {
      const { status, type, severity } = req.query;
      const filters: any = {};
      
      if (status) filters.status = status as string;
      if (type) filters.type = type as string;
      if (severity) filters.severity = severity as string;

      const complaints = await complaintService.getAllComplaints(filters);
      res.json(complaints);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Resolve complaint
   * POST /api/admin/complaints/:id/resolve
   */
  async resolveComplaint(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = resolveComplaintSchema.parse(req.body);
      
      const complaint = await complaintService.resolveComplaint(id, validatedData.resolution);
      res.json(complaint);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get dashboard statistics
   * GET /api/admin/dashboard
   */
  async getDashboardStats(_req: AuthRequest, res: Response) {
    try {
      const stats = await adminService.getDashboardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const adminController = new AdminController();
