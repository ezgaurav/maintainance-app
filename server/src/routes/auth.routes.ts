import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * Authentication routes
 */

// POST /api/auth/register - Register new user
router.post('/register', (req, res) => authController.register(req, res));

// POST /api/auth/login - Login user
router.post('/login', (req, res) => authController.login(req, res));

// POST /api/auth/admin-login - Admin login
router.post('/admin-login', (req, res) => authController.adminLogin(req, res));

// POST /api/auth/send-otp - Send OTP to phone
router.post('/send-otp', (req, res) => authController.sendOTP(req, res));

// POST /api/auth/verify-otp - Verify OTP
router.post('/verify-otp', (req, res) => authController.verifyOTP(req, res));

// GET /api/auth/me - Get current user profile (protected)
router.get('/me', authMiddleware, (req, res) => authController.getProfile(req, res));

export default router;
