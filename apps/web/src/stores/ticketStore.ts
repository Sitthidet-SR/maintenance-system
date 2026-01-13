import { create } from 'zustand';
import { Ticket, TicketStatus, TicketPriority, CreateTicketInput, UpdateTicketInput } from '@/types';
import { apiGet, apiPost, apiPatch, apiDelete } from '@/lib/api';

interface TicketFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string;
  search?: string;
}

interface TicketState {
  tickets: Ticket[];
  currentTicket: Ticket | null;
  isLoading: boolean;
  error: string | null;
  filters: TicketFilters;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  fetchTickets: () => Promise<void>;
  fetchTicketById: (id: string) => Promise<void>;
  createTicket: (data: CreateTicketInput) => Promise<Ticket>;
  updateTicket: (id: string, data: UpdateTicketInput) => Promise<void>;
  deleteTicket: (id: string) => Promise<void>;
  
  // Filter actions
  setFilters: (filters: TicketFilters) => void;
  clearFilters: () => void;
  setPage: (page: number) => void;
  
  // Realtime update
  updateTicketInList: (ticket: Ticket) => void;
  addTicketToList: (ticket: Ticket) => void;
  removeTicketFromList: (id: string) => void;
}

export const useTicketStore = create<TicketState>()((set, get) => ({
  tickets: [],
  currentTicket: null,
  isLoading: false,
  error: null,
  filters: {},
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  
  fetchTickets: async () => {
    set({ isLoading: true, error: null });
    try {
      const { filters, pagination } = get();
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      };
      
      const response = await apiGet<{
        data: Ticket[];
        meta: { total: number; page: number; limit: number; totalPages: number };
      }>('/tickets', params);
      
      set({
        tickets: response.data,
        pagination: {
          ...get().pagination,
          ...response.meta,
        },
        isLoading: false,
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch tickets';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  fetchTicketById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiGet<{ data: Ticket }>(`/tickets/${id}`);
      set({ currentTicket: response.data, isLoading: false });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch ticket';
      set({ error: errorMessage, isLoading: false });
    }
  },
  
  createTicket: async (data: CreateTicketInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiPost<{ data: Ticket }>('/tickets', data);
      set({ isLoading: false });
      return response.data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create ticket';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  updateTicket: async (id: string, data: UpdateTicketInput) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiPatch<{ data: Ticket }>(`/tickets/${id}`, data);
      
      // Update in list if exists
      set((state) => ({
        tickets: state.tickets.map((t) => (t.id === id ? response.data : t)),
        currentTicket: state.currentTicket?.id === id ? response.data : state.currentTicket,
        isLoading: false,
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update ticket';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  deleteTicket: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiDelete(`/tickets/${id}`);
      set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== id),
        isLoading: false,
      }));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete ticket';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },
  
  setFilters: (filters: TicketFilters) => {
    set({ filters, pagination: { ...get().pagination, page: 1 } });
    get().fetchTickets();
  },
  
  clearFilters: () => {
    set({ filters: {}, pagination: { ...get().pagination, page: 1 } });
    get().fetchTickets();
  },
  
  setPage: (page: number) => {
    set({ pagination: { ...get().pagination, page } });
    get().fetchTickets();
  },
  
  // Realtime updates
  updateTicketInList: (ticket: Ticket) => {
    set((state) => ({
      tickets: state.tickets.map((t) => (t.id === ticket.id ? ticket : t)),
      currentTicket: state.currentTicket?.id === ticket.id ? ticket : state.currentTicket,
    }));
  },
  
  addTicketToList: (ticket: Ticket) => {
    set((state) => ({
      tickets: [ticket, ...state.tickets],
    }));
  },
  
  removeTicketFromList: (id: string) => {
    set((state) => ({
      tickets: state.tickets.filter((t) => t.id !== id),
    }));
  },
}));
