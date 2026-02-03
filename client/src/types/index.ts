export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: 'customer' | 'technician' | 'admin';
  address?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  govtId?: string;
  skills?: string[];
  workingAreas?: string[];
  isVerified?: boolean;
  isBlocked?: boolean;
  rating?: number;
  totalJobs?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Issue {
  _id: string;
  customer: User | string;
  technician?: User | string;
  applianceType: string;
  brand?: string;
  model?: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'accepted' | 'in-progress' | 'completed' | 'rejected';
  images?: string[];
  address: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  scheduledDate?: string;
  scheduledTime?: string;
  completionDetails?: {
    summary: string;
    images: string[];
    video?: string;
    audio?: string;
    cost: number;
  };
  rating?: number;
  review?: string;
  assignedAt?: string;
  acceptedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SparePart {
  _id: string;
  name: string;
  category: string;
  description?: string;
  price: number;
  stock: number;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  _id: string;
  technician: User | string;
  items: Array<{
    sparePart: SparePart | string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  user: User | string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface Complaint {
  _id: string;
  issue: Issue | string;
  customer: User | string;
  technician?: User | string;
  subject: string;
  description: string;
  status: 'pending' | 'resolved';
  resolution?: string;
  resolvedBy?: User | string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  sparePart: SparePart;
  quantity: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string>;
}
