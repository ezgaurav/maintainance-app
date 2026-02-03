import api from './api';
import { SparePart, Order } from '../types';

export const sparePartService = {
  // Get all spare parts
  getAllSpareParts: async (filters?: { category?: string; search?: string }): Promise<SparePart[]> => {
    const { data } = await api.get('/spare-parts', { params: filters });
    return data;
  },

  // Get spare part by ID
  getSparePartById: async (id: string): Promise<SparePart> => {
    const { data } = await api.get(`/spare-parts/${id}`);
    return data;
  },

  // Create spare part (admin)
  createSparePart: async (partData: FormData): Promise<SparePart> => {
    const { data } = await api.post('/spare-parts', partData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Update spare part (admin)
  updateSparePart: async (id: string, partData: Partial<SparePart>): Promise<SparePart> => {
    const { data } = await api.put(`/spare-parts/${id}`, partData);
    return data;
  },

  // Delete spare part (admin)
  deleteSparePart: async (id: string): Promise<void> => {
    await api.delete(`/spare-parts/${id}`);
  },

  // Create order
  createOrder: async (orderData: {
    items: Array<{ sparePart: string; quantity: number; price: number }>;
    totalAmount: number;
    shippingAddress: string;
  }): Promise<Order> => {
    const { data } = await api.post('/orders', orderData);
    return data;
  },

  // Get my orders (technician)
  getMyOrders: async (): Promise<Order[]> => {
    const { data } = await api.get('/orders/my-orders');
    return data;
  },

  // Get all orders (admin)
  getAllOrders: async (): Promise<Order[]> => {
    const { data } = await api.get('/orders');
    return data;
  },
};
