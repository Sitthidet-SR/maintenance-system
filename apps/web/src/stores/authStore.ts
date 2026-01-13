import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole } from '@/types';
import { apiPost, apiGet, setAccessToken, api } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  
  // Role helpers
  hasRole: (role: UserRole) => boolean;
  isAdmin: () => boolean;
  isTechnician: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiPost<{ success: boolean; data: { user: User; accessToken: string } }>('/auth/login', { email, password });
          
          if (response.success && response.data) {
             setAccessToken(response.data.accessToken);
             set({ 
               user: response.data.user, 
               isAuthenticated: true, 
               isLoading: false 
             });
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      register: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          await apiPost('/auth/register', { name, email, password });
          set({ isLoading: false });
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Registration failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          await apiPost('/auth/logout');
        } finally {
          setAccessToken(null);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
      
      checkAuth: async () => {
        // If we have user data persisted but no accessToken (page refresh scenario),
        // try to refresh the token first using the httpOnly cookie
        const state = get();
        
        // If localStorage says we're authenticated, try to refresh token
        if (state.isAuthenticated && state.user) {
          set({ isLoading: true });
          try {
            // Try to refresh the token first
            const refreshResponse = await api.post<{ success: boolean; accessToken: string }>('/auth/refresh');
            if (refreshResponse.data.accessToken) {
              setAccessToken(refreshResponse.data.accessToken);
              
              // Now verify with /auth/me
              const meResponse = await apiGet<{ success: boolean; data: { user: User } }>('/auth/me');
              if (meResponse.success && meResponse.data.user) {
                set({ 
                  user: meResponse.data.user, 
                  isAuthenticated: true, 
                  isLoading: false 
                });
                return;
              }
            }
          } catch {
            // Refresh failed, clear auth state
            setAccessToken(null);
            set({ 
              user: null, 
              isAuthenticated: false, 
              isLoading: false 
            });
          }
        } else {
          // No persisted auth, just check loading state
          set({ isLoading: false });
        }
      },
      
      clearError: () => set({ error: null }),
      
      hasRole: (role: UserRole) => {
        const user = get().user;
        return user?.role === role;
      },
      
      isAdmin: () => get().hasRole('ADMIN'),
      isTechnician: () => get().hasRole('TECHNICIAN') || get().hasRole('ADMIN'),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
