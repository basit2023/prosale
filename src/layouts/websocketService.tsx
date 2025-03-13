let wss: WebSocket | null = null;

export const connectWebSocket = () => {
  if (!wss || wss.readyState === WebSocket.CLOSED || wss.readyState === WebSocket.CLOSING) {
    console.log('🔄 Attempting to connect to WebSocket...');
    
    wss = new WebSocket('ws://localhost:4001'); // Change to `wss://` in production if using HTTPS

    wss.onopen = () => {
      console.log('✅ Connected to WebSocket server');
    };

    wss.onmessage = (event) => {
      console.log('📩 WebSocket message received:', event.data);
    };

    wss.onclose = () => {
      console.warn('❌ WebSocket closed. Reconnecting in 5 seconds...');
      setTimeout(connectWebSocket, 5000); // Auto-reconnect after 5 seconds
    };

    wss.onerror = (error) => {
      console.error('⚠️ WebSocket error:', error);
    };
  }
};

export const getWebSocket = (): WebSocket | null => wss;

export default { connectWebSocket, getWebSocket };




  useEffect(() => {
    websocketService.connectWebSocket(); // Ensure WebSocket is connected
  
    const listenToWebSocket = () => {
      let ws = websocketService.getWebSocket();
  
      if (!ws) {
        console.warn('⚠️ WebSocket is not yet initialized. Retrying in 1 second...');
        setTimeout(listenToWebSocket, 1000);
        return;
      }
  
      const handleWebSocketMessage = (event: MessageEvent) => {
        try {
          const { event: eventType, data } = JSON.parse(event.data);
          console.log('📩 WebSocket event received:', eventType, data);
  
          if (eventType === 'lead_assigned' || eventType === 'lead_reassigned') {
            setNotifications((prev) => [
              { id: Date.now(), message: data.message, created_at: new Date(), notification_mark: 0 },
              ...prev,
            ]);
            setUnreadCount((prev) => prev + 1);
          }
        } catch (error) {
          console.error('⚠️ Error parsing WebSocket message:', error);
        }
      };
  
      if (ws.readyState === WebSocket.OPEN) {
        ws.addEventListener('message', handleWebSocketMessage);
      } else {
        console.warn('⚠️ WebSocket not open yet. Retrying...');
        setTimeout(listenToWebSocket, 1000);
      }
  
      return () => {
        let ws = websocketService.getWebSocket();
        if (ws) {
          ws.removeEventListener('message', handleWebSocketMessage);
        }
      };
    };
  
    listenToWebSocket();
  }, []);
  

  import websocketService from '@/layouts/websocketService';