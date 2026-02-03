import { create } from 'zustand';
import { User, Notification, CartItem, SparePart } from '../types';
import { authService } from '../services/auth.service';
import { socketService } from '../services/socket.service';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Notification) => void;
  setNotifications: (notifications: Notification[]) => void;
  markAsRead: (id: string) => void;
  clearNotifications: () => void;
}

interface CartState {
  items: CartItem[];
  addToCart: (sparePart: SparePart, quantity: number) => void;
  removeFromCart: (sparePartId: string) => void;
  updateQuantity: (sparePartId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  login: (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    socketService.connect(token);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    authService.logout();
    socketService.disconnect();
    set({ token: null, user: null, isAuthenticated: false });
  },
  setUser: (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },
}));

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: notification.isRead ? state.unreadCount : state.unreadCount + 1,
    }));
  },
  setNotifications: (notifications: Notification[]) => {
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    set({ notifications, unreadCount });
  },
  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n._id === id ? { ...n, isRead: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  addToCart: (sparePart: SparePart, quantity: number) => {
    set((state) => {
      const existingItem = state.items.find(
        (item) => item.sparePart._id === sparePart._id
      );
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.sparePart._id === sparePart._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { items: [...state.items, { sparePart, quantity }] };
    });
  },
  removeFromCart: (sparePartId: string) => {
    set((state) => ({
      items: state.items.filter((item) => item.sparePart._id !== sparePartId),
    }));
  },
  updateQuantity: (sparePartId: string, quantity: number) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.sparePart._id === sparePartId ? { ...item, quantity } : item
      ),
    }));
  },
  clearCart: () => {
    set({ items: [] });
  },
  getTotalAmount: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.sparePart.price * item.quantity, 0);
  },
}));
