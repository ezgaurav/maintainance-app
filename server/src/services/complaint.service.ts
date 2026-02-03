import { supabase } from '../config/supabase';
import { notificationService } from './notification.service';

class ComplaintService {
  /**
   * Create a complaint
   */
  async createComplaint(data: {
    filed_by: string;
    against_user?: string;
    issue_id?: string;
    type: 'complaint' | 'refund_request' | 'system_issue';
    description: string;
    severity?: 'low' | 'medium' | 'high';
  }) {
    const { data: complaint, error } = await supabase
      .from('complaints')
      .insert({
        ...data,
        severity: data.severity || 'medium',
        status: 'open'
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create complaint: ' + error.message);
    }

    // Notify admins
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    if (admins) {
      for (const admin of admins) {
        await notificationService.create({
          user_id: admin.id,
          type: 'new-complaint',
          title: 'New Complaint Filed',
          message: `A new ${data.type} has been filed.`,
          data: { complaint_id: complaint.id }
        });
      }
    }

    return complaint;
  }

  /**
   * Get all complaints (admin)
   */
  async getAllComplaints(filters?: { status?: string; type?: string; severity?: string }) {
    let query = supabase
      .from('complaints')
      .select(`
        *,
        filed_by_user:filed_by (id, name, phone, email, role),
        against_user:against_user (id, name, phone, email, role),
        issue:issue_id (id, appliance_type, status)
      `)
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.severity) {
      query = query.eq('severity', filters.severity);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch complaints: ' + error.message);
    }

    return data;
  }

  /**
   * Get complaint by ID
   */
  async getComplaintById(complaintId: string) {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        filed_by_user:filed_by (id, name, phone, email, role),
        against_user:against_user (id, name, phone, email, role),
        issue:issue_id (*)
      `)
      .eq('id', complaintId)
      .single();

    if (error || !data) {
      throw new Error('Complaint not found');
    }

    return data;
  }

  /**
   * Get user's complaints
   */
  async getUserComplaints(userId: string) {
    const { data, error } = await supabase
      .from('complaints')
      .select('*')
      .eq('filed_by', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch complaints: ' + error.message);
    }

    return data;
  }

  /**
   * Update complaint status (admin)
   */
  async updateComplaintStatus(
    complaintId: string,
    status: 'open' | 'investigating' | 'resolved' | 'rejected',
    resolution?: string
  ) {
    const updates: any = { status };

    if (status === 'resolved' || status === 'rejected') {
      updates.resolution = resolution || '';
      updates.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('complaints')
      .update(updates)
      .eq('id', complaintId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update complaint status: ' + error.message);
    }

    // Notify the user who filed the complaint
    await notificationService.create({
      user_id: data.filed_by,
      type: 'complaint-updated',
      title: 'Complaint Status Updated',
      message: `Your complaint has been ${status}. ${resolution || ''}`,
      data: { complaint_id: complaintId, status }
    });

    return data;
  }

  /**
   * Resolve complaint (admin)
   */
  async resolveComplaint(complaintId: string, resolution: string) {
    return this.updateComplaintStatus(complaintId, 'resolved', resolution);
  }

  /**
   * Reject complaint (admin)
   */
  async rejectComplaint(complaintId: string, reason: string) {
    return this.updateComplaintStatus(complaintId, 'rejected', reason);
  }
}

export const complaintService = new ComplaintService();
