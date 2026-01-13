import { create } from 'zustand';
import { User, UserRole } from '@/types';
import { apiGet, apiPatch, apiDelete } from '@/lib/api';
import { toast } from 'sonner';

interface UserFilters {
  search?: string;
  role?: UserRole;
}

interface UserStore {
  users: User[];
  isLoading: boolean;
  filters: UserFilters;
  
  // Actions
  setFilters: (filters: UserFilters) => void;
  fetchUsers: () => Promise<void>;
  updateUserRole: (id: string, role: UserRole) => Promise<void>;
  updateUserDepartment: (id: string, department: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUserStore = create<UserStore>((set, get) => ({
  users: [],
  isLoading: false,
  filters: {},

  setFilters: (filters) => {
    set({ filters });
    get().fetchUsers();
  },

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.role) params.append('role', filters.role);

      const response = await apiGet<{ success: boolean; data: User[] }>(`/users?${params.toString()}`);
      if (response.success) {
        set({ users: response.data });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to fetch users');
    } finally {
      set({ isLoading: false });
    }
  },

  updateUserRole: async (id, role) => {
    try {
      const response = await apiPatch<{ success: boolean; data: User }>(`/users/${id}/role`, { role });
      if (response.success) {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
        }));
        toast.success(`User role updated to ${role}`);
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await apiDelete<{ success: boolean }>(`/users/${id}`);
      if (response.success) {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
        toast.success('User deleted successfully');
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      toast.error('Failed to delete user');
      throw error;
    }
  },

  updateUserDepartment: async (id, department) => {
    try {
      const response = await apiPatch<{ success: boolean; data: User }>(`/users/${id}`, { department });
      if (response.success) {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, department } : u)),
        }));
        toast.success('Department updated');
      }
    } catch (error) {
      console.error('Failed to update department:', error);
      toast.error('Failed to update department');
      throw error;
    }
  },
}));
