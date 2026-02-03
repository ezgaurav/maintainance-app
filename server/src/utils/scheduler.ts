import cron from 'node-cron';
import { supabase } from '../config/supabase';
import { emitToUser, emitToAdmins } from '../config/socket';
import { notificationService } from '../services/notification.service';

/**
 * Schedule all cron jobs
 */
export const initScheduledTasks = () => {
  console.log('Initializing scheduled tasks...');

  // Check for acceptance timeouts every 5 minutes
  cron.schedule('*/5 * * * *', checkAcceptanceTimeouts);

  // Check for unassigned issues every hour
  cron.schedule('0 * * * *', checkUnassignedIssues);

  // Check for payment releases every day at midnight
  cron.schedule('0 0 * * *', checkPaymentReleases);

  // Check for 3-day re-evaluation every day at 9 AM
  cron.schedule('0 9 * * *', check3DayReEvaluation);

  // Check for low stock alerts every hour
  cron.schedule('0 * * * *', checkLowStockAlerts);

  console.log('Scheduled tasks initialized successfully');
};

/**
 * Check for issues where technician hasn't accepted within 1 hour
 */
const checkAcceptanceTimeouts = async () => {
  try {
    const now = new Date().toISOString();

    const { data: issues, error } = await supabase
      .from('issues')
      .select('*, technicians(*), users!issues_customer_id_fkey(*)')
      .eq('status', 'assigned')
      .lt('acceptance_deadline', now);

    if (error) {
      console.error('Error checking acceptance timeouts:', error);
      return;
    }

    if (issues && issues.length > 0) {
      for (const issue of issues) {
        // Update issue status back to pending
        await supabase
          .from('issues')
          .update({ 
            status: 'pending',
            technician_id: null,
            assigned_at: null,
            acceptance_deadline: null
          })
          .eq('id', issue.id);

        // Notify admin
        await notificationService.create({
          user_id: 'admin', // Will need to fetch all admins
          type: 'acceptance-timeout',
          title: 'Technician Acceptance Timeout',
          message: `Issue #${issue.id} was not accepted within 1 hour. It has been reset to pending.`,
          data: { issue_id: issue.id }
        });

        emitToAdmins('acceptance-timeout', { issueId: issue.id });
      }

      console.log(`Processed ${issues.length} acceptance timeouts`);
    }
  } catch (error) {
    console.error('Error in checkAcceptanceTimeouts:', error);
  }
};

/**
 * Check for issues that have been unassigned for 2+ hours
 */
const checkUnassignedIssues = async () => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

    const { data: issues, error } = await supabase
      .from('issues')
      .select('*, users!issues_customer_id_fkey(*)')
      .eq('status', 'pending')
      .lt('created_at', twoHoursAgo);

    if (error) {
      console.error('Error checking unassigned issues:', error);
      return;
    }

    if (issues && issues.length > 0) {
      // Fetch all admin users
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      for (const issue of issues) {
        // Notify all admins
        if (admins) {
          for (const admin of admins) {
            await notificationService.create({
              user_id: admin.id,
              type: 'no-tech-found',
              title: 'Unassigned Issue Alert',
              message: `Issue #${issue.id} has been unassigned for 2+ hours.`,
              data: { issue_id: issue.id }
            });

            emitToUser(admin.id, 'no-tech-found', { issueId: issue.id });
          }
        }
      }

      console.log(`Alerted admins about ${issues.length} unassigned issues`);
    }
  } catch (error) {
    console.error('Error in checkUnassignedIssues:', error);
  }
};

/**
 * Check for payments ready to be released (7-15 days after completion)
 */
const checkPaymentReleases = async () => {
  try {
    const now = new Date().toISOString();

    const { data: issues, error } = await supabase
      .from('issues')
      .select('*')
      .eq('payment_status', 'held')
      .lt('payment_hold_until', now);

    if (error) {
      console.error('Error checking payment releases:', error);
      return;
    }

    if (issues && issues.length > 0) {
      for (const issue of issues) {
        // Update payment status to released
        await supabase
          .from('issues')
          .update({ payment_status: 'released' })
          .eq('id', issue.id);

        // Notify technician
        if (issue.technician_id) {
          await notificationService.create({
            user_id: issue.technician_id,
            type: 'payment-released',
            title: 'Payment Released',
            message: `Payment for issue #${issue.id} has been released.`,
            data: { issue_id: issue.id, amount: issue.final_cost }
          });

          emitToUser(issue.technician_id, 'payment-released', {
            issueId: issue.id,
            amount: issue.final_cost
          });
        }
      }

      console.log(`Released ${issues.length} payments`);
    }
  } catch (error) {
    console.error('Error in checkPaymentReleases:', error);
  }
};

/**
 * Send 3-day re-evaluation notifications to customers
 */
const check3DayReEvaluation = async () => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: issues, error } = await supabase
      .from('issues')
      .select('*')
      .eq('status', 'completed')
      .lte('completed_at', threeDaysAgo)
      .is('rating', null);

    if (error) {
      console.error('Error checking 3-day re-evaluation:', error);
      return;
    }

    if (issues && issues.length > 0) {
      for (const issue of issues) {
        await notificationService.create({
          user_id: issue.customer_id,
          type: '3-day-reminder',
          title: 'How was the service?',
          message: `It's been 3 days since your issue was completed. Please share your feedback!`,
          data: { issue_id: issue.id }
        });

        emitToUser(issue.customer_id, 'new-notification', {
          type: '3-day-reminder',
          issueId: issue.id
        });
      }

      console.log(`Sent ${issues.length} 3-day re-evaluation reminders`);
    }
  } catch (error) {
    console.error('Error in check3DayReEvaluation:', error);
  }
};

/**
 * Check for low stock alerts
 */
const checkLowStockAlerts = async () => {
  try {
    const { data: parts, error } = await supabase
      .from('spare_parts')
      .select('*')
      .filter('stock', 'lte', supabase.rpc('low_stock_threshold'));

    if (error) {
      console.error('Error checking low stock:', error);
      return;
    }

    if (parts && parts.length > 0) {
      // Fetch all admin users
      const { data: admins } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'admin');

      const lowStockParts = parts.filter(part => part.stock <= part.low_stock_threshold);

      if (lowStockParts.length > 0 && admins) {
        for (const admin of admins) {
          for (const part of lowStockParts) {
            await notificationService.create({
              user_id: admin.id,
              type: 'low-stock-alert',
              title: 'Low Stock Alert',
              message: `${part.name} is running low (${part.stock} left).`,
              data: { part_id: part.id, stock: part.stock }
            });
          }

          emitToUser(admin.id, 'low-stock-alert', {
            parts: lowStockParts.map(p => ({ id: p.id, name: p.name, stock: p.stock }))
          });
        }

        console.log(`Sent low stock alerts for ${lowStockParts.length} parts`);
      }
    }
  } catch (error) {
    console.error('Error in checkLowStockAlerts:', error);
  }
};
