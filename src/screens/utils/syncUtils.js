import axios from 'axios';

/**
 * Sync data when online: Fetch from server and push unsynced local changes.
 * @param {string} userId - The user ID.
 * @param {object} db - The SQLite database instance.
 */
export const syncIfOnline = async (userId, db) => {
  try {
    // Step 1: Pull the data from the server (sync server to local)
    const { last_sync_timestamp } = await db.getFirstAsync(
      'SELECT MAX(updated_at) AS last_sync_timestamp FROM journal_entries WHERE user_id = ?',
      [userId]
    );

    const response = await axios.get('https://journal-server-ot0w.onrender.com/syncToClient', {
      params: { last_sync_timestamp },
    });

    if (response.status === 200 && response.data.entries) {
      // Step 2: Insert or update the entries in the local database
      const entries = response.data.entries;
      console.log('Entries from server:', entries);
      const insertOrUpdateQuery = `
        INSERT INTO journal_entries (entry_id, user_id, title, content, created_at, updated_at, deleted_at, version)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(entry_id) 
        DO UPDATE SET 
          title = excluded.title,
          content = excluded.content,
          updated_at = excluded.updated_at,
          deleted_at = excluded.deleted_at,
          version = excluded.version;
      `;

      for (const entry of entries) {
        await db.runAsync(insertOrUpdateQuery, [
          entry.journal_id,
          entry.user_id,
          entry.title,
          entry.content,
          entry.created_at,
          entry.updated_at,
          entry.deleted_at || null,
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
      journal_id: entry.entry_id,
      user_id: entry.user_id,
      title: entry.title,
      content: entry.content,
      created_at: entry.created_at,
      updated_at: entry.updated_at,
      deleted_at: entry.deleted_at || null,
      version: entry.version || 1,
    }));

    const pushResponse = await axios.post('https://journal-server-ot0w.onrender.com/syncToServer', {
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
    console.error('Error syncing to server:', error.response ? error.response.data : error.message);
    throw error; // Re-throw the error to handle it in the caller
  }
};
