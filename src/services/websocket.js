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
      socket.onopen = async () => {
        setConnected(true);
        console.log('Connected to WebSocket', userId);

        // Pull journals from server and sync local journals
        await pullAndSyncJournals(userId);

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
        reconnectWebSocket();
      };
    };

    const reconnectWebSocket = () => {
      if (retryCount < 5) { // Limit to 5 retries to avoid infinite loops
        const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        reconnectInterval = setTimeout(() => {
          console.log('Reconnecting to WebSocket...');
          setRetryCount((prev) => prev + 1); // Increment retry count
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

// Function to pull and sync journals
const pullAndSyncJournals = async (userId) => {
  try {
    if (socket && socket.readyState === WebSocket.OPEN) {
      // Request journals from server
      socket.send(JSON.stringify({ type: 'pull_journals', userId }));

      // Wait for server response
      socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'journal_entries') {
          const serverJournals = data.journals || [];

          // Fetch local journals
          const localJournals = JSON.parse(await AsyncStorage.getItem('journalEntries')) || [];

          // Merge server journals with local journals
          const mergedJournals = mergeJournals(serverJournals, localJournals);

          // Save merged journals to local storage
          await AsyncStorage.setItem('journalEntries', JSON.stringify(mergedJournals));
          console.log('Journals merged and saved locally.');

          // Sync unsynced journals
          syncUnsyncedJournals(userId, mergedJournals);
        }
      };
    } else {
      console.error('WebSocket is not open. Cannot pull journals.');
    }
  } catch (error) {
    console.error('Error pulling and syncing journals:', error);
  }
};

// Function to merge server and local journals
const mergeJournals = (serverJournals, localJournals) => {
  const journalMap = new Map();

  // Add server journals to the map (server entries take priority)
  serverJournals.forEach((journal) => journalMap.set(journal.id, journal));

  // Add local journals to the map (only if not present in server journals)
  localJournals.forEach((journal) => {
    if (!journalMap.has(journal.id)) {
      journalMap.set(journal.id, journal);
    }
  });

  return Array.from(journalMap.values());
};

// Function to sync unsynced local journals
const syncUnsyncedJournals = async (userId, mergedJournals) => {
  try {
    const unsyncedJournals = mergedJournals.filter(
      (journal) => journal.user_id === userId && !journal.is_synced
    );

    if (unsyncedJournals.length > 0) {
      if (socket && socket.readyState === WebSocket.OPEN) {
        // Send the unsynced journals to the server
        socket.send(JSON.stringify({ type: 'sync_journals', journals: unsyncedJournals }));
        console.log('Sending unsynced journals for user:', userId, unsyncedJournals);

        // Mark journals as synced locally
        const updatedJournals = mergedJournals.map((journal) => {
          if (journal.user_id === userId && !journal.is_synced) {
            return { ...journal, is_synced: true };
          }
          return journal;
        });

        // Save updated journals back to AsyncStorage
        await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedJournals));
        console.log('Updated journal entries with is_synced set to true.');
      } else {
        console.error('WebSocket is not open or available.');
      }
    } else {
      console.log('No unsynced journals to sync.');
    }
  } catch (error) {
    console.error('Error syncing unsynced journals:', error);
  }
};

export { useWebSocket, pullAndSyncJournals };
