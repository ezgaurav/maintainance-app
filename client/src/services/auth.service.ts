import api from './api';
import { AuthResponse, User } from '../types';

export const authService = {
  // Customer login
  loginCustomer: async (phone: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/customer/login', { phone, password });
    return data;
  },

  // Customer register
  registerCustomer: async (userData: {
    name: string;
    phone: string;
    password: string;
    address: string;
    location?: { coordinates: [number, number] };
  }): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/customer/register', userData);
    return data;
  },

  // Technician login
  loginTechnician: async (phone: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/technician/login', { phone, password });
    return data;
  },

  // Technician register
  registerTechnician: async (userData: FormData): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/technician/register', userData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Admin login
  loginAdmin: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/admin/login', { email, password });
    return data;
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get('/auth/me');
    return data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};
