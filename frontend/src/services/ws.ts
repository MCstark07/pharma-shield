type EventCallback = (data: any) => void;

class WebSocketClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, EventCallback[]> = new Map();
  private reconnectInterval: number = 3000;
  private url: string;

  constructor() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    this.url = `${protocol}//${host}/ws`;
  }

  public connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('[WebSocket] Connected to PharmaShield broadcast feed');
      };

      this.socket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          const eventType = message.type;
          const eventData = message.data;

          const callbacks = this.listeners.get(eventType) || [];
          callbacks.forEach((cb) => cb(eventData));

          // Also notify wildcards
          const allCallbacks = this.listeners.get('*') || [];
          allCallbacks.forEach((cb) => cb(message));
        } catch (err) {
          console.error('[WebSocket] Error parsing event data:', err);
        }
      };

      this.socket.onclose = () => {
        console.log('[WebSocket] Disconnected. Reconnecting in 3s...');
        setTimeout(() => this.connect(), this.reconnectInterval);
      };

      this.socket.onerror = (err) => {
        console.warn('[WebSocket] Error encountered:', err);
      };
    } catch (e) {
      console.error('[WebSocket] Setup exception:', e);
      setTimeout(() => this.connect(), this.reconnectInterval);
    }
  }

  public on(eventType: string, callback: EventCallback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)?.push(callback);
  }

  public off(eventType: string, callback: EventCallback) {
    const list = this.listeners.get(eventType);
    if (list) {
      this.listeners.set(
        eventType,
        list.filter((cb) => cb !== callback)
      );
    }
  }
}

export const wsClient = new WebSocketClient();

