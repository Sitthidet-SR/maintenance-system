import { Ticket } from '@/types';
import { useTicketStore } from '@/stores';

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
  const store = useTicketStore.getState();

  console.log('[WebSocket] Received:', event, data);

  switch (event) {
    case 'ticket:created':
      store.addTicketToList(data as Ticket);
      break;
    case 'ticket:updated':
      store.updateTicketInList(data as Ticket);
      break;
    case 'ticket:deleted':
      store.removeTicketFromList(data as string);
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
