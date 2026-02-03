import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase';
import { 
  RegisterRequest, 
  LoginRequest, 
  AdminLoginRequest,
  OTPRequest,
  VerifyOTPRequest,
  AuthPayload 
} from '../types';

class AuthService {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest) {
    const { name, phone, password, email, address, role } = data;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      throw new Error('User with this phone number already exists');
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        name,
        phone,
        email,
        password_hash,
        address,
        role
      })
      .select()
      .single();

    if (userError || !newUser) {
      throw new Error('Failed to create user: ' + userError?.message);
    }

    // If technician, create technician profile
    if (role === 'technician') {
      const { 
        government_id_image, 
        skills = [], 
        working_areas = [],
        latitude,
        longitude 
      } = data;

      if (!government_id_image) {
        throw new Error('Government ID image is required for technician registration');
      }

      const { error: techError } = await supabase
        .from('technicians')
        .insert({
          id: newUser.id,
          government_id_image,
          skills,
          working_areas,
          latitude,
          longitude,
          status: 'pending'
        });

      if (techError) {
        // Rollback user creation
        await supabase.from('users').delete().eq('id', newUser.id);
        throw new Error('Failed to create technician profile: ' + techError.message);
      }
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: newUser.id,
      role: newUser.role as 'customer' | 'technician' | 'admin'
    });

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        phone: newUser.phone,
        email: newUser.email,
        role: newUser.role,
        otp_verified: newUser.otp_verified
      },
      token
    };
  }

  /**
   * Login user
   */
  async login(data: LoginRequest) {
    const { phone, password } = data;

    // Find user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error || !user) {
      throw new Error('Invalid phone number or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash || '');

    if (!isValidPassword) {
      throw new Error('Invalid phone number or password');
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      role: user.role as 'customer' | 'technician' | 'admin'
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        otp_verified: user.otp_verified
      },
      token
    };
  }

  /**
   * Admin login with email
   */
  async adminLogin(data: AdminLoginRequest) {
    const { email, password } = data;

    // Find admin user
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('role', 'admin')
      .single();

    if (error || !user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash || '');

    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken({
      userId: user.id,
      role: 'admin'
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    };
  }

  /**
   * Send OTP (placeholder - integrate with Supabase Auth or SMS provider)
   */
  async sendOTP(_data: OTPRequest) {
    // In production, integrate with Supabase Auth or SMS provider like Twilio
    // For now, return a mock OTP (in development only)
    if (process.env.NODE_ENV === 'development') {
      return {
        message: 'OTP sent successfully',
        otp: '123456' // Mock OTP for development
      };
    }

    // TODO: Implement actual OTP sending
    return {
      message: 'OTP sent successfully'
    };
  }

  /**
   * Verify OTP
   */
  async verifyOTP(data: VerifyOTPRequest) {
    const { phone, otp } = data;

    // In production, verify with Supabase Auth or SMS provider
    // For now, accept '123456' in development
    if (process.env.NODE_ENV === 'development' && otp === '123456') {
      // Update user's otp_verified status
      const { error } = await supabase
        .from('users')
        .update({ otp_verified: true })
        .eq('phone', phone);

      if (error) {
        throw new Error('Failed to verify OTP');
      }

      return {
        message: 'OTP verified successfully',
        verified: true
      };
    }

    // TODO: Implement actual OTP verification
    throw new Error('Invalid OTP');
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId: string) {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !user) {
      throw new Error('User not found');
    }

    // If technician, fetch technician profile
    if (user.role === 'technician') {
      const { data: techProfile } = await supabase
        .from('technicians')
        .select('*')
        .eq('id', userId)
        .single();

      return {
        ...user,
        technician_profile: techProfile
      };
    }

    return user;
  }

  /**
   * Generate JWT token
   */
  private generateToken(payload: AuthPayload): string {
    return jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '7d'
    });
  }
}

export const authService = new AuthService();
