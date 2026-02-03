import api from './api';
import { Issue } from '../types';

export const issueService = {
  // Create issue
  createIssue: async (issueData: FormData): Promise<Issue> => {
    const { data } = await api.post('/issues', issueData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Get all issues (for admin)
  getAllIssues: async (filters?: {
    status?: string;
    priority?: string;
    search?: string;
  }): Promise<Issue[]> => {
    const { data } = await api.get('/issues', { params: filters });
    return data;
  },

  // Get my issues (for customer)
  getMyIssues: async (): Promise<Issue[]> => {
    const { data } = await api.get('/issues/my-issues');
    return data;
  },

  // Get assigned jobs (for technician)
  getAssignedJobs: async (): Promise<Issue[]> => {
    const { data } = await api.get('/issues/assigned-jobs');
    return data;
  },

  // Get issue by ID
  getIssueById: async (id: string): Promise<Issue> => {
    const { data } = await api.get(`/issues/${id}`);
    return data;
  },

  // Assign technician to issue (admin)
  assignTechnician: async (issueId: string, technicianId: string): Promise<Issue> => {
    const { data } = await api.patch(`/issues/${issueId}/assign`, { technicianId });
    return data;
  },

  // Accept issue (technician)
  acceptIssue: async (issueId: string): Promise<Issue> => {
    const { data } = await api.patch(`/issues/${issueId}/accept`);
    return data;
  },

  // Reject issue (technician)
  rejectIssue: async (issueId: string, reason: string): Promise<Issue> => {
    const { data } = await api.patch(`/issues/${issueId}/reject`, { reason });
    return data;
  },

  // Schedule issue (technician)
  scheduleIssue: async (
    issueId: string,
    scheduledDate: string,
    scheduledTime: string
  ): Promise<Issue> => {
    const { data } = await api.patch(`/issues/${issueId}/schedule`, {
      scheduledDate,
      scheduledTime,
    });
    return data;
  },

  // Complete issue (technician)
  completeIssue: async (issueId: string, completionData: FormData): Promise<Issue> => {
    const { data } = await api.patch(`/issues/${issueId}/complete`, completionData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  // Rate issue (customer)
  rateIssue: async (issueId: string, rating: number, review?: string): Promise<Issue> => {
    const { data } = await api.patch(`/issues/${issueId}/rate`, { rating, review });
    return data;
  },

  // Find technicians for issue (admin)
  findTechnicians: async (issueId: string): Promise<any[]> => {
    const { data } = await api.get(`/issues/${issueId}/find-technicians`);
    return data;
  },

  // Force complete (admin)
  forceComplete: async (issueId: string): Promise<Issue> => {
    const { data } = await api.patch(`/issues/${issueId}/force-complete`);
    return data;
  },
};
