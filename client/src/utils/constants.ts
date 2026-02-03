export const APPLIANCE_CATEGORIES = {
  HA: [
    'Air Conditioner',
    'Washing Machine',
    'Refrigerator',
    'Freezer',
    'TV',
    'Cooler',
    'Water Dispenser',
    'Micro Oven',
  ],
  SHA: ['Iron', 'Mixture', 'Induction', 'Heater', 'Fan', 'Geyser'],
};

export const PRIORITY_LEVELS = ['low', 'medium', 'high', 'urgent'] as const;

export const ISSUE_STATUSES = [
  'pending',
  'assigned',
  'accepted',
  'in-progress',
  'completed',
  'rejected',
] as const;

export const ORDER_STATUSES = [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export const NOTIFICATION_TYPES = ['info', 'success', 'warning', 'error'] as const;

export const USER_ROLES = ['customer', 'technician', 'admin'] as const;

export const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB
export const MIN_COMPLETION_IMAGES = 3;

export const SOCKET_EVENTS = {
  NEW_ISSUE: 'new-issue',
  ISSUE_ASSIGNED: 'issue-assigned',
  ISSUE_ACCEPTED: 'issue-accepted',
  ISSUE_REJECTED: 'issue-rejected',
  ISSUE_COMPLETED: 'issue-completed',
  NEW_NOTIFICATION: 'new-notification',
  TECHNICIAN_VERIFIED: 'technician-verified',
  ORDER_STATUS_UPDATED: 'order-status-updated',
} as const;

export const SPARE_PART_CATEGORIES = [
  'Compressor',
  'Motor',
  'Pump',
  'Filter',
  'Belt',
  'Sensor',
  'Control Board',
  'Thermostat',
  'Fan',
  'Capacitor',
  'Other',
] as const;

export const TECHNICIAN_SKILLS = [
  'Air Conditioner Repair',
  'Washing Machine Repair',
  'Refrigerator Repair',
  'TV Repair',
  'Microwave Repair',
  'Iron Repair',
  'Mixer Repair',
  'Induction Repair',
  'Heater Repair',
  'Fan Repair',
  'Geyser Repair',
  'Electrical Work',
  'Plumbing',
  'General Maintenance',
  'Installation',
] as const;

export const APPLIANCE_TYPES = [
  'Air Conditioner',
  'Washing Machine',
  'Refrigerator',
  'Freezer',
  'TV',
  'Cooler',
  'Water Dispenser',
  'Micro Oven',
  'Iron',
  'Mixture',
  'Induction',
  'Heater',
  'Fan',
  'Geyser',
] as const;

export const WORKING_AREAS = [
  'North Delhi',
  'South Delhi',
  'East Delhi',
  'West Delhi',
  'Central Delhi',
  'Noida',
  'Gurgaon',
  'Faridabad',
  'Ghaziabad',
] as const;
