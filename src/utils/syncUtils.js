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
      params: { 
        last_sync_timestamp,
        user_id: userId // Pass the userId to the server to filter data by user
      },
    });

    if (response.status === 200 && response.data.entries) {
      // Step 2: Insert or update the entries in the local database
      const entries = response.data.entries;
      console.log('Entries from server:', entries);
      const insertOrUpdateQuery = `
      INSERT INTO journal_entries (journal_id, user_id, title, content, created_at, updated_at, journal_status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(journal_id) 
      DO UPDATE SET 
        title = excluded.title,
        content = excluded.content,
        updated_at = excluded.updated_at,
        journal_status = excluded.journal_status,      
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

export const syncMoodsIfOnline = async (userId, db) => {
  try {
    // Step 1: Pull the data from the server (sync server to local)
    const { last_sync_timestamp } = await db.getFirstAsync(
      'SELECT MAX(created_at) AS last_sync_timestamp FROM moods WHERE user_id = ?',
      [userId]
    );

    const response = await axios.get(`${localAPI}/syncMoodsToClient`, {
      params: { last_sync_timestamp, user_id: userId },
    });

    if (response.status === 200 && response.data.moods) {
      // Step 2: Insert or update the moods in the local database
      const moods = response.data.moods;
      console.log('Moods from server:', moods);
      const insertOrUpdateQuery = `
      INSERT INTO moods (mood_id, user_id, mood, created_at, mood_status)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(mood_id)
      DO UPDATE SET 
        mood = excluded.mood,
        created_at = excluded.created_at,
        mood_status = excluded.mood_status,
    `;
    
    
      for (const mood of moods) {
        await db.runAsync(insertOrUpdateQuery, [
          mood.mood_id,  // Local mood_id mapped to mood_id on the server
          mood.user_id,
          mood.mood,
          mood.created_at,
          mood.mood_status || 'active',  
        ]);
      }
    
      console.log('Server data synced successfully to local database.');
    }

    // Step 3: Push unsynced data from local to server
    const unsyncedMoods = await db.getAllAsync(
      'SELECT * FROM moods WHERE user_id = ? AND sync_status != ?',
      [userId, 'synced']
    );

    if (unsyncedMoods.length === 0) {
      console.log('No unsynced moods found.');
      return;
    }

    const moodsToPush = unsyncedMoods.map((mood) => ({
      mood_id: mood.mood_id,  // Corrected to mood_id
      user_id: mood.user_id,
      mood: mood.mood,
      created_at: mood.created_at,
      mood_status: mood.mood_status,
    }));

    const pushResponse = await axios.post(`${localAPI}/syncMoodsToServer`, {
      moods: moodsToPush,
    });

    if (pushResponse.status === 200) {
      for (const mood of unsyncedMoods) {
        await db.runAsync(
          'UPDATE moods SET sync_status = ? WHERE mood_id = ?',
          ['synced', mood.mood_id]
        );
      }
      console.log('Local changes pushed to server successfully!');
    }
  } catch (error) {
    // Log error properly in case response is missing
    console.error('Error syncing moods to server:', error.response ? error.response.data : error.message);
    throw error;  // Re-throw the error to handle it in the caller
  }
};
