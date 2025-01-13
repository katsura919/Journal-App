import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

let socket;
let reconnectInterval;

const useWebSocket = (userId) => {
  const [connected, setConnected] = useState(false);
  const [retryCount, setRetryCount] = useState(0); // Track number of retries

  useEffect(() => {
    const connectWebSocket = () => {
      socket = new WebSocket(`ws://10.0.2.2:5000?userId=${userId}`);

      // Handle connection opened
      socket.onopen = () => {
        setConnected(true);
        console.log('Connected to WebSocket', userId);
        syncJournals(userId);  // Sync journals when the WebSocket is open
        setRetryCount(0); // Reset retry count on successful connection
      };

      // Handle incoming messages
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Message from server:', data);
      };

      // Handle connection errors
      socket.onerror = (error) => {
        console.error('WebSocket Error:', error);
        setConnected(false);
      };

      // Handle connection closed
      socket.onclose = () => {
        setConnected(false);
        console.log('Disconnected from WebSocket');
        // Start reconnecting with an interval
        reconnectWebSocket();
      };
    };

    const reconnectWebSocket = () => {
      if (retryCount < 5) { // Limit to 5 retries to avoid infinite loops
        const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        reconnectInterval = setTimeout(() => {
          console.log('Reconnecting to WebSocket...');
          setRetryCount(prev => prev + 1); // Increment retry count
          connectWebSocket(); // Try reconnecting
        }, retryDelay);
      } else {
        console.log('Max reconnect attempts reached.');
      }
    };

    // Initial WebSocket connection
    connectWebSocket();

    // Clean up on component unmount
    return () => {
      if (socket) {
        socket.close();
      }
      if (reconnectInterval) {
        clearTimeout(reconnectInterval);
      }
    };
  }, [userId, retryCount]);

  return { socket, connected };
};

// Function to sync journals
const syncJournals = async (userId) => {
  try {
    // Fetch all journals from AsyncStorage
    const journals = JSON.parse(await AsyncStorage.getItem('journalEntries')) || [];

    // Filter journals for the current user and unsynced ones
    const unsyncedJournals = journals.filter(journal => journal.user_id === userId && !journal.is_synced);

    // If there are unsynced journals, send them
    if (unsyncedJournals.length > 0) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Send the unsynced journals to the server
        socket.send(JSON.stringify({ type: 'sync_journals', journals: unsyncedJournals }));
        console.log('Sending unsynced journals for user:', userId, unsyncedJournals);

        // After sending, update the journals to set is_synced to true
        const updatedJournals = journals.map(journal => {
          if (journal.user_id === userId && !journal.is_synced) {
            return { ...journal, is_synced: true };
          }
          return journal;
        });

        // Save the updated journals back to AsyncStorage
        await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedJournals));
        console.log('Updated journal entries with is_synced set to true');
      } else {
        console.error('WebSocket is not open or available');
      }
    } else {
      console.log('No unsynced journals found for user:', userId);
    }
  } catch (error) {
    console.error('Error syncing journals for user:', userId, error);
  }
};

export { useWebSocket, syncJournals };
