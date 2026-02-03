import { supabase } from '../config/supabase';
import { CreateIssueRequest } from '../types';
import { emitToAdmins, emitToUser } from '../config/socket';
import { notificationService } from './notification.service';
import { calculateDistance } from '../utils/distance';

class IssueService {
  /**
   * Create a new issue
   */
  async createIssue(customerId: string, data: CreateIssueRequest) {
    const {
      appliance_type,
      brand,
      model,
      issue_description,
      priority,
      images,
      address,
      latitude,
      longitude
    } = data;

    const { data: issue, error } = await supabase
      .from('issues')
      .insert({
        customer_id: customerId,
        appliance_type,
        brand,
        model,
        issue_description,
        priority,
        images,
        address,
        latitude,
        longitude,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create issue: ' + error.message);
    }

    // Notify all admins
    const { data: admins } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    if (admins) {
      for (const admin of admins) {
        await notificationService.create({
          user_id: admin.id,
          type: 'new-issue',
          title: 'New Issue Created',
          message: `New ${appliance_type} repair issue created by customer.`,
          data: { issue_id: issue.id }
        });
      }

      // Emit real-time event to admins
      emitToAdmins('new-issue', { issue });
    }

    return issue;
  }

  /**
   * Get customer's issues
   */
  async getCustomerIssues(customerId: string) {
    const { data, error } = await supabase
      .from('issue_details')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch issues: ' + error.message);
    }

    return data;
  }

  /**
   * Get technician's assigned jobs
   */
  async getTechnicianJobs(technicianId: string) {
    const { data, error } = await supabase
      .from('issue_details')
      .select('*')
      .eq('technician_id', technicianId)
      .in('status', ['assigned', 'accepted', 'ongoing'])
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch jobs: ' + error.message);
    }

    return data;
  }

  /**
   * Get issue by ID
   */
  async getIssueById(issueId: string) {
    const { data, error } = await supabase
      .from('issue_details')
      .select('*')
      .eq('id', issueId)
      .single();

    if (error) {
      throw new Error('Issue not found');
    }

    return data;
  }

  /**
   * Get all issues (admin)
   */
  async getAllIssues(filters?: { status?: string; priority?: string }) {
    let query = supabase
      .from('issue_details')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.priority) {
      query = query.eq('priority', filters.priority);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch issues: ' + error.message);
    }

    return data;
  }

  /**
   * Find matching technicians for an issue
   */
  async findMatchingTechnicians(issueId: string) {
    // Get issue details
    const { data: issue } = await supabase
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .single();

    if (!issue) {
      throw new Error('Issue not found');
    }

    // Get all active technicians with required skill
    const { data: technicians } = await supabase
      .from('active_technicians')
      .select('*');

    if (!technicians || technicians.length === 0) {
      return [];
    }

    // Filter by skill match
    const applianceType = issue.appliance_type.toLowerCase();
    const skillMatchedTechs = technicians.filter(tech => 
      tech.skills.some((skill: string) => skill.toLowerCase().includes(applianceType))
    );

    // If issue has location, sort by distance
    if (issue.latitude && issue.longitude) {
      const techsWithDistance = skillMatchedTechs
        .filter(tech => tech.latitude && tech.longitude)
        .map(tech => ({
          ...tech,
          distance: calculateDistance(
            issue.latitude!,
            issue.longitude!,
            tech.latitude,
            tech.longitude
          )
        }))
        .sort((a, b) => a.distance - b.distance);

      return techsWithDistance.slice(0, 10); // Return top 10
    }

    return skillMatchedTechs.slice(0, 10);
  }

  /**
   * Assign technician to issue (admin)
   */
  async assignTechnician(issueId: string, technicianId: string) {
    // Set acceptance deadline (1 hour from now)
    const acceptanceDeadline = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { data: issue, error } = await supabase
      .from('issues')
      .update({
        technician_id: technicianId,
        status: 'assigned',
        assigned_at: new Date().toISOString(),
        acceptance_deadline: acceptanceDeadline
      })
      .eq('id', issueId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to assign technician: ' + error.message);
    }

    // Notify technician
    await notificationService.create({
      user_id: technicianId,
      type: 'issue-assigned',
      title: 'New Job Assigned',
      message: 'You have been assigned a new repair job. Please accept within 1 hour.',
      data: { issue_id: issueId }
    });

    emitToUser(technicianId, 'issue-assigned', { issue });

    return issue;
  }

  /**
   * Accept job (technician)
   */
  async acceptJob(issueId: string, technicianId: string) {
    // Verify this technician is assigned to this job
    const { data: issue } = await supabase
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .eq('technician_id', technicianId)
      .eq('status', 'assigned')
      .single();

    if (!issue) {
      throw new Error('Job not found or already accepted');
    }

    // Check if within acceptance deadline
    if (new Date(issue.acceptance_deadline!) < new Date()) {
      throw new Error('Acceptance deadline has passed');
    }

    // Update status
    const { data: updatedIssue, error } = await supabase
      .from('issues')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to accept job: ' + error.message);
    }

    // Notify customer
    await notificationService.create({
      user_id: issue.customer_id,
      type: 'issue-accepted',
      title: 'Technician Accepted',
      message: 'A technician has accepted your repair request.',
      data: { issue_id: issueId }
    });

    emitToUser(issue.customer_id, 'issue-accepted', { issue: updatedIssue });

    return updatedIssue;
  }

  /**
   * Reject job (technician)
   */
  async rejectJob(issueId: string, technicianId: string) {
    // Verify this technician is assigned to this job
    const { data: issue } = await supabase
      .from('issues')
      .select('*')
      .eq('id', issueId)
      .eq('technician_id', technicianId)
      .eq('status', 'assigned')
      .single();

    if (!issue) {
      throw new Error('Job not found or already processed');
    }

    // Reset to pending
    const { error } = await supabase
      .from('issues')
      .update({
        technician_id: null,
        status: 'pending',
        assigned_at: null,
        acceptance_deadline: null
      })
      .eq('id', issueId);

    if (error) {
      throw new Error('Failed to reject job: ' + error.message);
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
          type: 'job-rejected',
          title: 'Job Rejected',
          message: `Technician rejected issue #${issueId}`,
          data: { issue_id: issueId }
        });
      }
    }

    return { success: true };
  }

  /**
   * Schedule job (technician)
   */
  async scheduleJob(issueId: string, technicianId: string, scheduledDate: string, scheduledTime: string) {
    const { data: issue, error } = await supabase
      .from('issues')
      .update({
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        status: 'ongoing'
      })
      .eq('id', issueId)
      .eq('technician_id', technicianId)
      .eq('status', 'accepted')
      .select()
      .single();

    if (error) {
      throw new Error('Failed to schedule job: ' + error.message);
    }

    // Notify customer
    await notificationService.create({
      user_id: issue.customer_id,
      type: 'job-scheduled',
      title: 'Job Scheduled',
      message: `Your repair has been scheduled for ${scheduledDate} at ${scheduledTime}`,
      data: { issue_id: issueId, scheduled_date: scheduledDate, scheduled_time: scheduledTime }
    });

    return issue;
  }

  /**
   * Complete job (technician)
   */
  async completeJob(
    issueId: string,
    technicianId: string,
    data: {
      completion_summary: string;
      completion_photos: string[];
      completion_video?: string;
      completion_audio?: string;
      final_cost: number;
    }
  ) {
    const { completion_summary, completion_photos, completion_video, completion_audio, final_cost } = data;

    // Validate required evidence
    if (!completion_summary || completion_photos.length < 3) {
      throw new Error('Completion requires a summary and at least 3 photos');
    }

    // Calculate payment hold date (7 days from now)
    const paymentHoldUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: issue, error } = await supabase
      .from('issues')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completion_summary,
        completion_photos,
        completion_video,
        completion_audio,
        final_cost,
        payment_status: 'held',
        payment_hold_until: paymentHoldUntil
      })
      .eq('id', issueId)
      .eq('technician_id', technicianId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to complete job: ' + error.message);
    }

    // Notify customer
    await notificationService.create({
      user_id: issue.customer_id,
      type: 'issue-completed',
      title: 'Job Completed',
      message: 'Your repair has been completed. Please rate the service.',
      data: { issue_id: issueId }
    });

    emitToUser(issue.customer_id, 'issue-completed', { issue });

    return issue;
  }

  /**
   * Rate completed job (customer)
   */
  async rateJob(issueId: string, customerId: string, rating: number, comment?: string) {
    if (rating < 1 || rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const { data: issue, error } = await supabase
      .from('issues')
      .update({
        rating,
        rating_comment: comment,
        rated_at: new Date().toISOString()
      })
      .eq('id', issueId)
      .eq('customer_id', customerId)
      .eq('status', 'completed')
      .select()
      .single();

    if (error) {
      throw new Error('Failed to rate job: ' + error.message);
    }

    // Notify technician
    if (issue.technician_id) {
      await notificationService.create({
        user_id: issue.technician_id,
        type: 'new-rating',
        title: 'New Rating Received',
        message: `You received a ${rating}-star rating!`,
        data: { issue_id: issueId, rating }
      });

      emitToUser(issue.technician_id, 'new-rating', { issueId, rating });
    }

    return issue;
  }

  /**
   * Force complete job (admin)
   */
  async forceCompleteJob(issueId: string, reason: string) {
    const { data: issue, error } = await supabase
      .from('issues')
      .update({
        status: 'force_completed',
        completed_at: new Date().toISOString(),
        completion_summary: `Force completed by admin. Reason: ${reason}`
      })
      .eq('id', issueId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to force complete job: ' + error.message);
    }

    // Notify both customer and technician
    await notificationService.create({
      user_id: issue.customer_id,
      type: 'issue-force-completed',
      title: 'Issue Resolved',
      message: 'Your issue has been marked as completed by admin.',
      data: { issue_id: issueId }
    });

    if (issue.technician_id) {
      await notificationService.create({
        user_id: issue.technician_id,
        type: 'issue-force-completed',
        title: 'Job Force Completed',
        message: `Issue #${issueId} was force completed by admin.`,
        data: { issue_id: issueId }
      });
    }

    return issue;
  }

  /**
   * Cancel issue (customer)
   */
  async cancelIssue(issueId: string, customerId: string) {
    const { data: issue, error } = await supabase
      .from('issues')
      .update({
        status: 'cancelled'
      })
      .eq('id', issueId)
      .eq('customer_id', customerId)
      .in('status', ['pending', 'assigned'])
      .select()
      .single();

    if (error) {
      throw new Error('Failed to cancel issue: ' + error.message);
    }

    // Notify technician if assigned
    if (issue.technician_id) {
      await notificationService.create({
        user_id: issue.technician_id,
        type: 'issue-cancelled',
        title: 'Job Cancelled',
        message: `Issue #${issueId} was cancelled by the customer.`,
        data: { issue_id: issueId }
      });
    }

    return issue;
  }
}

export const issueService = new IssueService();
