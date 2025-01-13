import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Example function to sync journals to the server
const syncJournals = async () => {
  try {
    const entries = JSON.parse(await AsyncStorage.getItem('journalEntries')) || [];
    const unsyncedEntries = entries.filter(entry => !entry.is_synced);

    if (unsyncedEntries.length > 0) {
      // Simulating server sync (replace with actual API call)
      const response = await fetch('https://your-server.com/sync-journals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unsyncedEntries),
      });

      if (response.ok) {
        // Mark all entries as synced after successful upload
        const updatedEntries = entries.map(entry =>
          unsyncedEntries.some(unsynced => unsynced.id === entry.id)
            ? { ...entry, is_synced: true }
            : entry
        );

        await AsyncStorage.setItem('journalEntries', JSON.stringify(updatedEntries));
        Alert.alert('Success', 'Journals synced successfully!');
      } else {
        Alert.alert('Error', 'Failed to sync journals.');
      }
    }
  } catch (error) {
    console.error('Error syncing journals:', error);
    Alert.alert('Error', 'Failed to sync journals.');
  }
};

// Listen for network status changes and trigger sync when connected
const startSyncOnNetworkChange = () => {
  NetInfo.addEventListener(state => {
    if (state.isConnected) {
      // Internet connection is available, sync journals
      syncJournals();
    }
  });
};

// Call this function in your component's lifecycle or app initialization
export const startSyncing = () => {
  startSyncOnNetworkChange();
};
