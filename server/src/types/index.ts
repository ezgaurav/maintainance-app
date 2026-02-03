// User types
export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  password_hash?: string;
  address?: string;
  role: 'customer' | 'technician' | 'admin';
  otp_verified: boolean;
  email_verified: boolean;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface Technician {
  id: string;
  government_id_image: string;
  government_id_verified: boolean;
  skills: string[];
  working_areas?: string[];
  latitude?: number;
  longitude?: number;
  rating: number;
  total_ratings: number;
  status: 'pending' | 'active' | 'suspended' | 'blocked';
  joined_date: string;
}

export interface Issue {
  id: string;
  customer_id: string;
  technician_id?: string;
  appliance_type: string;
  brand?: string;
  model?: string;
  issue_description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  images?: string[];
  address: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'assigned' | 'accepted' | 'ongoing' | 'completed' | 'cancelled' | 'force_completed';
  created_at: string;
  assigned_at?: string;
  accepted_at?: string;
  acceptance_deadline?: string;
  completed_at?: string;
  scheduled_date?: string;
  scheduled_time?: string;
  completion_summary?: string;
  completion_photos?: string[];
  completion_video?: string;
  completion_audio?: string;
  estimated_cost?: number;
  final_cost?: number;
  payment_status: 'pending' | 'held' | 'released' | 'refunded';
  payment_hold_until?: string;
  rating?: number;
  rating_comment?: string;
  rated_at?: string;
}

export interface SparePart {
  id: string;
  name: string;
  description?: string;
  category: 'HA' | 'SHA' | 'Tool' | 'Maintenance' | 'Accessory';
  price: number;
  stock: number;
  low_stock_threshold: number;
  image?: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  items: OrderItem[];
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  payment_status: 'pending' | 'paid' | 'failed';
  created_at: string;
}

export interface OrderItem {
  part_id: string;
  quantity: number;
  price: number;
}

export interface Complaint {
  id: string;
  filed_by: string;
  against_user?: string;
  issue_id?: string;
  type: 'complaint' | 'refund_request' | 'system_issue';
  description: string;
  severity: 'low' | 'medium' | 'high';
  status: 'open' | 'investigating' | 'resolved' | 'rejected';
  resolution?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message?: string;
  data?: any;
  read: boolean;
  created_at: string;
}

// API Request/Response types
export interface RegisterRequest {
  name: string;
  phone: string;
  password: string;
  email?: string;
  address?: string;
  role: 'customer' | 'technician';
  // Technician-specific fields
  government_id_image?: string;
  skills?: string[];
  working_areas?: string[];
  latitude?: number;
  longitude?: number;
}

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface OTPRequest {
  phone: string;
}

export interface VerifyOTPRequest {
  phone: string;
  otp: string;
}

export interface CreateIssueRequest {
  appliance_type: string;
  brand?: string;
  model?: string;
  issue_description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  images?: string[];
  address: string;
  latitude?: number;
  longitude?: number;
}

export interface AuthPayload {
  userId: string;
  role: 'customer' | 'technician' | 'admin';
}
