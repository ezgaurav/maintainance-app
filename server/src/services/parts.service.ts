import { supabase } from '../config/supabase';
import { SparePart } from '../types';

class PartsService {
  /**
   * Get all spare parts
   */
  async getAllParts(filters?: { category?: string; inStock?: boolean }) {
    let query = supabase
      .from('spare_parts')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.inStock) {
      query = query.gt('stock', 0);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch spare parts: ' + error.message);
    }

    return data;
  }

  /**
   * Get spare part by ID
   */
  async getPartById(partId: string) {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .eq('id', partId)
      .single();

    if (error || !data) {
      throw new Error('Spare part not found');
    }

    return data;
  }

  /**
   * Create spare part (admin)
   */
  async createPart(data: {
    name: string;
    description?: string;
    category: 'HA' | 'SHA' | 'Tool' | 'Maintenance' | 'Accessory';
    price: number;
    stock: number;
    low_stock_threshold?: number;
    image?: string;
  }) {
    const { data: part, error } = await supabase
      .from('spare_parts')
      .insert(data)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create spare part: ' + error.message);
    }

    return part;
  }

  /**
   * Update spare part (admin)
   */
  async updatePart(partId: string, updates: Partial<SparePart>) {
    const { data, error } = await supabase
      .from('spare_parts')
      .update(updates)
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update spare part: ' + error.message);
    }

    return data;
  }

  /**
   * Delete spare part (admin)
   */
  async deletePart(partId: string) {
    const { error } = await supabase
      .from('spare_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      throw new Error('Failed to delete spare part: ' + error.message);
    }

    return { success: true };
  }

  /**
   * Update stock quantity
   */
  async updateStock(partId: string, quantity: number) {
    const { data, error } = await supabase
      .from('spare_parts')
      .update({ stock: quantity })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update stock: ' + error.message);
    }

    return data;
  }

  /**
   * Get low stock parts
   */
  async getLowStockParts() {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .filter('stock', 'lte', 'low_stock_threshold')
      .order('stock', { ascending: true });

    if (error) {
      throw new Error('Failed to fetch low stock parts: ' + error.message);
    }

    return data;
  }

  /**
   * Search parts by name
   */
  async searchParts(searchTerm: string) {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .ilike('name', `%${searchTerm}%`)
      .limit(20);

    if (error) {
      throw new Error('Failed to search parts: ' + error.message);
    }

    return data;
  }
}

export const partsService = new PartsService();
