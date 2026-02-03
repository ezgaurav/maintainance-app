import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { authService } from '../services/auth.service';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^[0-9]{10}$/),
  password: z.string().min(6),
  email: z.string().email().optional(),
  address: z.string().optional(),
  role: z.enum(['customer', 'technician']),
  government_id_image: z.string().optional(),
  skills: z.array(z.string()).optional(),
  working_areas: z.array(z.string()).optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});

const loginSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/),
  password: z.string()
});

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const otpSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/)
});

const verifyOtpSchema = z.object({
  phone: z.string().regex(/^[0-9]{10}$/),
  otp: z.string()
});

class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(req: AuthRequest, res: Response) {
    try {
      const validatedData = registerSchema.parse(req.body);
      const result = await authService.register(validatedData);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: AuthRequest, res: Response) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const result = await authService.login(validatedData);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Admin login
   * POST /api/auth/admin-login
   */
  async adminLogin(req: AuthRequest, res: Response) {
    try {
      const validatedData = adminLoginSchema.parse(req.body);
      const result = await authService.adminLogin(validatedData);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(401).json({ error: error.message });
    }
  }

  /**
   * Send OTP
   * POST /api/auth/send-otp
   */
  async sendOTP(req: AuthRequest, res: Response) {
    try {
      const validatedData = otpSchema.parse(req.body);
      const result = await authService.sendOTP(validatedData);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Verify OTP
   * POST /api/auth/verify-otp
   */
  async verifyOTP(req: AuthRequest, res: Response) {
    try {
      const validatedData = verifyOtpSchema.parse(req.body);
      const result = await authService.verifyOTP(validatedData);
      res.json(result);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: 'Validation error', details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const profile = await authService.getUserProfile(req.user.userId);
      res.json(profile);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}

export const authController = new AuthController();
