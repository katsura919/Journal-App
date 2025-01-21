// src/background/syncToServer.js
import axios from 'axios';
import { useSQLiteContext } from 'expo-sqlite'; // Use the SQLite context for database operations

export async function syncToServer(userId) {
  const db = useSQLiteContext(); // Get the SQLite context
  try {
    // Fetch all unsynced journal entries from the local database
    const unsyncedEntries = await db.getAllAsync(
      'SELECT * FROM journal_entries WHERE user_id = ? AND sync_status != ?',
      [userId, 'synced']
    );
    console.log('Unsynced entries:', unsyncedEntries);
    for (const entry of unsyncedEntries) {
      const { journal_id, title, content, created_at, updated_at, sync_status } = entry;

      // Choose HTTP method based on sync status
      const response = await axios({
        method: sync_status === 'deleted' ? 'delete' : sync_status === 'updated' ? 'put' : 'post',
        url: 'http://10.0.2.2:5000/syncToServer',
        data: { userId, journal_id, title, content, created_at, updated_at },
      });

      // If server successfully receives the data, mark it as synced
      if (response.status === 200) {
        await db.runAsync(
          'UPDATE journal_entries SET sync_status = ? WHERE journal_id = ?',
          ['synced', journal_id]
        );
      }
    }

    console.log('Local changes successfully synced to the server.');
  } catch (error) {
    console.error('Error syncing to server:', error);
  }
}
