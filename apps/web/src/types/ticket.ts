// Ticket types
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type TicketCategory = 'ELECTRICAL' | 'PLUMBING' | 'HVAC' | 'IT' | 'GENERAL' | 'OTHER';

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  location?: string;
  
  // Relations
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  
  // Attachments
  attachments?: Attachment[];
  
  // SLA
  dueDate?: string;
  resolvedAt?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  ticketId: string;
  createdAt: string;
}

export interface TicketComment {
  id: string;
  content: string;
  ticketId: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdAt: string;
}

export interface TicketLog {
  id: string;
  ticketId: string;
  action: string;
  oldValue?: string;
  newValue?: string;
  userId: string;
  user?: {
    id: string;
    name: string;
  };
  createdAt: string;
}

// Form types
export interface CreateTicketInput {
  title: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  location?: string;
}

export interface UpdateTicketInput {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedToId?: string;
}
