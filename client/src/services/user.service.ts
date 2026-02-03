import api from './api';
import { User } from '../types';

export const userService = {
  // Get all customers (admin)
  getAllCustomers: async (): Promise<User[]> => {
    const { data } = await api.get('/users/customers');
    return data;
  },

  // Get all technicians (admin)
  getAllTechnicians: async (filters?: { isVerified?: boolean }): Promise<User[]> => {
    const { data } = await api.get('/users/technicians', { params: filters });
    return data;
  },

  // Verify technician (admin)
  verifyTechnician: async (id: string): Promise<User> => {
    const { data } = await api.patch(`/users/technicians/${id}/verify`);
    return data;
  },

  // Block/Unblock user (admin)
  toggleBlockUser: async (id: string): Promise<User> => {
    const { data } = await api.patch(`/users/${id}/toggle-block`);
    return data;
  },

  // Get technician profile
  getTechnicianProfile: async (id: string): Promise<User> => {
    const { data } = await api.get(`/users/technicians/${id}`);
    return data;
  },

  // Update profile
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const { data } = await api.put('/users/profile', userData);
    return data;
  },
};
