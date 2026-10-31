import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketEvent {
  event_type: string;
  timestamp: string;
  data: any;
}

export function useWebSocketSync(onMessageReceived?: (event: WebSocketEvent) => void) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const [securityAlert, setSecurityAlert] = useState<any | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname || 'localhost';
    const wsUrl = `${protocol}//${host}:8000/ws/events`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[CYBER LAB WS] Connected to central real-time defense bus');
      };

      ws.onmessage = (event) => {
        try {
          const parsed: WebSocketEvent = JSON.parse(event.data);
          setLastEvent(parsed);

          if (parsed.event_type === 'SECURITY_ALERT') {
            setSecurityAlert(parsed.data);
          }

          if (onMessageReceived) {
            onMessageReceived(parsed);
          }
        } catch (e) {
          console.error('[CYBER LAB WS] Error parsing message:', e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2500);
      };

      ws.onerror = (err) => {
        console.warn('[CYBER LAB WS] Socket error:', err);
        ws.close();
      };
    } catch (err) {
      console.warn('[CYBER LAB WS] Connection failed, retrying in 3s...', err);
      reconnectTimeoutRef.current = setTimeout(connect, 3000);
    }
  }, [onMessageReceived]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) wsRef.current.close();
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, [connect]);

  const clearAlert = () => setSecurityAlert(null);

  return {
    isConnected,
    lastEvent,
    securityAlert,
    clearAlert,
  };
}

