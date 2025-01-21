// src/background/syncFromServer.js
import axios from 'axios';
import { useSQLiteContext } from 'expo-sqlite'; // Use the SQLite context for database operations
import AsyncStorage from '@react-native-async-storage/async-storage';

export async function syncFromServer(userId) {
  const db = useSQLiteContext(); // Get the SQLite context
  try {
    // Get the last sync time to fetch entries updated after that
    const lastSyncTime = await AsyncStorage.getItem('lastSyncTime') || '1970-01-01T00:00:00Z';

    // Fetch journal entries from the server that were updated after the last sync time
    const response = await axios.get('http://10.0.2.2.com:5000/syncToClient', {
      params: { userId, lastSyncTime },
    });

    if (response.status === 200 && Array.isArray(response.data)) {
      const entries = response.data;

      // Loop through the server entries and insert or update them in the local database
      for (const entry of entries) {
        const { journal_id, title, content, created_at, updated_at } = entry;

        await db.runAsync(
          `
          INSERT INTO journal_entries (journal_id, user_id, title, content, created_at, updated_at, sync_status)
          VALUES (?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(journal_id) DO UPDATE SET
            title = excluded.title,
            content = excluded.content,
            created_at = excluded.created_at,
            updated_at = excluded.updated_at,
            sync_status = 'synced'
          `,
          [journal_id, userId, title, content, created_at, updated_at, 'synced']
        );
      }

      // Store the new sync time to track the last successful sync
      const newSyncTime = new Date().toISOString();
      await AsyncStorage.setItem('lastSyncTime', newSyncTime);

      console.log('Server changes successfully synced to the local database.');
    }
  } catch (error) {
    console.error('Error syncing from server:', error);
  }
}
