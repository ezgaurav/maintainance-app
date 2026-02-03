import { supabase } from '../config/supabase';

class AdminService {
  /**
   * Get all users
   */
  async getAllUsers(filters?: { role?: string }) {
    let query = supabase
      .from('users')
      .select('id, name, phone, email, address, role, otp_verified, created_at')
      .order('created_at', { ascending: false });

    if (filters?.role) {
      query = query.eq('role', filters.role);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch users: ' + error.message);
    }

    return data;
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new Error('User not found');
    }

    // If technician, also fetch technician profile
    if (data.role === 'technician') {
      const { data: techProfile } = await supabase
        .from('technicians')
        .select('*')
        .eq('id', userId)
        .single();

      return {
        ...data,
        technician_profile: techProfile
      };
    }

    return data;
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    // Total users by role
    const { count: totalCustomers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer');

    const { count: totalTechnicians } = await supabase
      .from('technicians')
      .select('*', { count: 'exact', head: true });

    const { count: activeTechnicians } = await supabase
      .from('technicians')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Total issues by status
    const { count: pendingIssues } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: ongoingIssues } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .in('status', ['assigned', 'accepted', 'ongoing']);

    const { count: completedIssues } = await supabase
      .from('issues')
      .select('*', { count: 'exact', head: true })
      .in('status', ['completed', 'force_completed']);

    // Recent issues
    const { data: recentIssues } = await supabase
      .from('issue_details')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Open complaints
    const { count: openComplaints } = await supabase
      .from('complaints')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'open');

    return {
      users: {
        total_customers: totalCustomers || 0,
        total_technicians: totalTechnicians || 0,
        active_technicians: activeTechnicians || 0
      },
      issues: {
        pending: pendingIssues || 0,
        ongoing: ongoingIssues || 0,
        completed: completedIssues || 0
      },
      complaints: {
        open: openComplaints || 0
      },
      recent_issues: recentIssues || []
    };
  }

  /**
   * Delete user (admin)
   */
  async deleteUser(userId: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new Error('Failed to delete user: ' + error.message);
    }

    return { success: true };
  }
}

export const adminService = new AdminService();
