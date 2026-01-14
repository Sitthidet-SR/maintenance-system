import { Ticket } from '@/types';
import { useTicketStore, useNotificationStore } from '@/stores';

let socket: WebSocket | null = null;
let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let isIntentionalClose = false;

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:8080/ws';
const RECONNECT_DELAY = 5000;

export const initSocket = () => {
  // Already connected or connecting
  if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
    return socket;
  }

  // Clear any pending reconnect
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  isIntentionalClose = false;
  console.log('[WebSocket] Connecting to:', WS_URL);

  try {
    socket = new WebSocket(WS_URL);
  } catch (error) {
    console.error('[WebSocket] Failed to create connection:', error);
    scheduleReconnect();
    return null;
  }

  socket.onopen = () => {
    console.log('[WebSocket] Connected successfully');
  };

  socket.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      handleMessage(msg);
    } catch (error) {
      console.error('[WebSocket] Message parse error:', error);
    }
  };

  socket.onclose = (event) => {
    console.log('[WebSocket] Disconnected:', event.code, event.reason || '(no reason)');
    socket = null;

    // Only reconnect if it wasn't an intentional close
    if (!isIntentionalClose) {
      scheduleReconnect();
    }
  };

  socket.onerror = () => {
    // Error details are not available in the browser for security reasons
    // The onclose event will fire after this with more useful info
    console.warn('[WebSocket] Connection error (will attempt reconnect on close)');
  };

  return socket;
};

const scheduleReconnect = () => {
  if (reconnectTimeout) return; // Already scheduled

  console.log(`[WebSocket] Reconnecting in ${RECONNECT_DELAY / 1000}s...`);
  reconnectTimeout = setTimeout(() => {
    reconnectTimeout = null;
    initSocket();
  }, RECONNECT_DELAY);
};

const handleMessage = (msg: { event: string; data: any }) => {
  const { event, data } = msg;
  const ticketStore = useTicketStore.getState();
  const notificationStore = useNotificationStore.getState();

  console.log('[WebSocket] Received:', event, data);

  switch (event) {
    case 'ticket:created':
      ticketStore.addTicketToList(data as Ticket);
      notifyTicketListeners(event, data);
      // Add notification for admins/technicians
      notificationStore.addNotification({
        title: 'งานแจ้งซ่อมใหม่',
        message: `${(data as Ticket).title}`,
        type: 'ticket',
        ticketId: (data as Ticket).id,
      });
      break;
    case 'ticket:updated':
      ticketStore.updateTicketInList(data as Ticket);
      notifyTicketListeners(event, data);
      // Add notification for status changes
      const ticket = data as Ticket;
      const statusText: Record<string, string> = {
        'OPEN': 'เปิดใหม่',
        'IN_PROGRESS': 'กำลังดำเนินการ',
        'PENDING': 'รอดำเนินการ',
        'RESOLVED': 'แก้ไขเสร็จแล้ว',
        'CLOSED': 'ปิดแล้ว',
      };
      notificationStore.addNotification({
        title: `สถานะอัปเดต: ${statusText[ticket.status] || ticket.status}`,
        message: `${ticket.title}`,
        type: 'ticket',
        ticketId: ticket.id,
      });
      break;
    case 'ticket:deleted':
      ticketStore.removeTicketFromList(data as string);
      notifyTicketListeners(event, data);
      break;
  }
};

export const disconnectSocket = () => {
  // Clear any pending reconnect
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  isIntentionalClose = true;

  if (socket) {
    socket.close(1000, 'Client disconnecting');
    socket = null;
  }
};

export const getSocketState = () => socket?.readyState;

// Listeners for component-level subscriptions
type TicketUpdateListener = (data: { event: string; ticket?: any }) => void;
const ticketUpdateListeners: Set<TicketUpdateListener> = new Set();

export const subscribeToTicketUpdates = (listener: TicketUpdateListener) => {
  ticketUpdateListeners.add(listener);
  return () => {
    ticketUpdateListeners.delete(listener);
  };
};

export const notifyTicketListeners = (event: string, ticket: any) => {
  ticketUpdateListeners.forEach((listener) => {
    listener({ event, ticket });
  });
};
