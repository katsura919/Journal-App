import axios from 'axios';

/**
 * Sync data when online: Fetch from server and push unsynced local changes.
 * @param {string} userId - The user ID.
 * @param {object} db - The SQLite database instance.
 */

const localAPI = 'http://10.0.2.2:5000';
const deployAPI = 'https://journal-server-ot0w.onrender.com';

export const syncIfOnline = async (userId, db) => {
  try {
    // Step 1: Pull the data from the server (sync server to local)
    const { last_sync_timestamp } = await db.getFirstAsync(
      'SELECT MAX(updated_at) AS last_sync_timestamp FROM journal_entries WHERE user_id = ?',
      [userId]
    );

    const response = await axios.get(`${localAPI}/syncToClient`, {
      params: { last_sync_timestamp },
    });

    if (response.status === 200 && response.data.entries) {
      // Step 2: Insert or update the entries in the local database
      const entries = response.data.entries;
      console.log('Entries from server:', entries);
      const insertOrUpdateQuery = `
      INSERT INTO journal_entries (journal_id, user_id, title, content, created_at, updated_at, journal_status, version)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(journal_id) 
      DO UPDATE SET 
        title = excluded.title,
        content = excluded.content,
        updated_at = excluded.updated_at,
        journal_status = excluded.journal_status,
        version = excluded.version;
    `;
    
    for (const entry of entries) {
      await db.runAsync(insertOrUpdateQuery, [
        entry.entry_id,  // Local entry_id mapped to journal_id on the server
        entry.user_id,
        entry.title,
        entry.content,
        entry.created_at,
        entry.updated_at,
        entry.journal_status || 'active',  // Default value if journal_status is missing
        entry.version || 1,
      ]);
    }
    
      console.log('Server data synced successfully to local database.');
    }

    // Step 3: Push unsynced data from local to server
    const unsyncedEntries = await db.getAllAsync(
      'SELECT * FROM journal_entries WHERE user_id = ? AND sync_status != ?',
      [userId, 'synced']
    );

    if (unsyncedEntries.length === 0) {
      console.log('No unsynced entries found.');
      return;
    }

    const entriesToPush = unsyncedEntries.map((entry) => ({
      journal_id: entry.entry_id,  // Corrected to entry_id
      user_id: entry.user_id,
      title: entry.title,
      content: entry.content,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      journal_status: entry.journal_status,
      version: entry.version || 1,
    }));

    const pushResponse = await axios.post(`${localAPI}/syncToServer`, {
      entries: entriesToPush,
    });

    if (pushResponse.status === 200) {
      for (const entry of unsyncedEntries) {
        await db.runAsync(
          'UPDATE journal_entries SET sync_status = ? WHERE entry_id = ?',
          ['synced', entry.entry_id]
        );
      }
      console.log('Local changes pushed to server successfully!');
    }
  } catch (error) {
    // Log error properly in case response is missing
    console.error('Error syncing to server:', error.response ? error.response.data : error.message);
    throw error;  // Re-throw the error to handle it in the caller
  }
};
