import NetInfo from '@react-native-community/netinfo';
import { useEffect, useState } from 'react';
import { syncJournals } from './websocket';  // Function to sync journals to the server
import { useWebSocket } from './websocket';  // Import your WebSocket hook

const useNetworkStatus = (userId) => {
  const [isOnline, setIsOnline] = useState(false);
  const { socket, connected } = useWebSocket(userId);  // Use WebSocket hook here

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      if (state.isConnected) {
        setIsOnline(true);
        if (socket && socket.readyState === WebSocket.OPEN) {
          console.log('WebSocket is already connected');
        } else {
          // Connect to WebSocket when the device is online
          console.log('Connecting to WebSocket...');
        }
        syncJournals(userId);  // Sync journals when the device comes online
      } else {
        setIsOnline(false);
        console.log('Device is offline');
      }
    });

    return () => unsubscribe();
  }, [userId, socket]);  // Add socket to dependency array to detect changes

  return { isOnline, connected };
};

export default useNetworkStatus;
