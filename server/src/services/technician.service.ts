import { supabase } from '../config/supabase';
import { notificationService } from './notification.service';

class TechnicianService {
  /**
   * Get technician profile
   */
  async getTechnicianProfile(technicianId: string) {
    const { data, error } = await supabase
      .from('technicians')
      .select(`
        *,
        users:id (
          name,
          phone,
          email,
          address,
          profile_image
        )
      `)
      .eq('id', technicianId)
      .single();

    if (error || !data) {
      throw new Error('Technician not found');
    }

    return data;
  }

  /**
   * Update technician profile
   */
  async updateProfile(technicianId: string, updates: {
    skills?: string[];
    working_areas?: string[];
    latitude?: number;
    longitude?: number;
  }) {
    const { data, error } = await supabase
      .from('technicians')
      .update(updates)
      .eq('id', technicianId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update technician profile: ' + error.message);
    }

    return data;
  }

  /**
   * Get all technicians (admin)
   */
  async getAllTechnicians(filters?: { status?: string }) {
    let query = supabase
      .from('technicians')
      .select(`
        *,
        users:id (
          name,
          phone,
          email,
          address,
          profile_image
        )
      `)
      .order('joined_date', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch technicians: ' + error.message);
    }

    return data;
  }

  /**
   * Verify technician (admin)
   */
  async verifyTechnician(technicianId: string, _adminId: string) {
    const { data, error } = await supabase
      .from('technicians')
      .update({
        government_id_verified: true,
        status: 'active'
      })
      .eq('id', technicianId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to verify technician: ' + error.message);
    }

    // Notify technician
    await notificationService.create({
      user_id: technicianId,
      type: 'account-verified',
      title: 'Account Verified',
      message: 'Your account has been verified. You can now accept jobs!',
      data: {}
    });

    return data;
  }

  /**
   * Block/Unblock technician (admin)
   */
  async updateTechnicianStatus(
    technicianId: string,
    status: 'active' | 'suspended' | 'blocked',
    reason?: string
  ) {
    const { data, error } = await supabase
      .from('technicians')
      .update({ status })
      .eq('id', technicianId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update technician status: ' + error.message);
    }

    // Notify technician
    await notificationService.create({
      user_id: technicianId,
      type: 'account-status-changed',
      title: 'Account Status Updated',
      message: `Your account has been ${status}. ${reason || ''}`,
      data: { status, reason }
    });

    return data;
  }

  /**
   * Get technician statistics
   */
  async getTechnicianStats(technicianId: string) {
    // Get completed jobs count
    const { count: completedJobs } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .eq('technician_id', technicianId)
      .in('status', ['completed', 'force_completed']);

    // Get ongoing jobs count
    const { count: ongoingJobs } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .eq('technician_id', technicianId)
      .in('status', ['assigned', 'accepted', 'ongoing']);

    // Get ratings info
    const { data: techInfo } = await supabase
      .from('technicians')
      .select('rating, total_ratings')
      .eq('id', technicianId)
      .single();

    // Calculate earnings (sum of final_cost for completed jobs)
    const { data: earnings } = await supabase
      .from('issues')
      .select('final_cost')
      .eq('technician_id', technicianId)
      .in('status', ['completed', 'force_completed']);

    const totalEarnings = earnings?.reduce((sum, issue) => sum + (issue.final_cost || 0), 0) || 0;

    return {
      completed_jobs: completedJobs || 0,
      ongoing_jobs: ongoingJobs || 0,
      rating: techInfo?.rating || 5.0,
      total_ratings: techInfo?.total_ratings || 0,
      total_earnings: totalEarnings
    };
  }
}

export const technicianService = new TechnicianService();
