import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'ticket';
  title: string;
  message: string;
  read: boolean;
  ticketId?: string;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: crypto.randomUUID(),
      read: false,
      createdAt: new Date().toISOString(),
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  
  markAsRead: (id: string) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
  
  removeNotification: (id: string) => {
    const notification = get().notifications.find((n) => n.id === id);
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: notification && !notification.read 
        ? Math.max(0, state.unreadCount - 1) 
        : state.unreadCount,
    }));
  },
  
  clearAll: () => {
    set({ notifications: [], unreadCount: 0 });
  },
}));
