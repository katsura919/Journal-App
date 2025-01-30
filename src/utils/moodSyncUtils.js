export const syncMoodsIfOnline = async (userId, db) => {
    try {
      // Step 1: Pull the data from the server (sync server to local)
      const { last_sync_timestamp } = await db.getFirstAsync(
        'SELECT MAX(created_at) AS last_sync_timestamp FROM moods WHERE user_id = ?',
        [userId]
      );
  
      const response = await axios.get(`${localAPI}/syncMoodsToClient`, {
        params: { last_sync_timestamp },
      });
  
      if (response.status === 200 && response.data.moods) {
        // Step 2: Insert or update the moods in the local database
        const moods = response.data.moods;
        console.log('Moods from server:', moods);
        const insertOrUpdateQuery = `
          INSERT INTO moods (mood_id, user_id, mood, date, created_at)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(mood_id)
          DO UPDATE SET 
            mood = excluded.mood,
            date = excluded.date,
            created_at = excluded.created_at;
        `;
      
        for (const mood of moods) {
          await db.runAsync(insertOrUpdateQuery, [
            mood.mood_id,  // Local mood_id mapped to mood_id on the server
            mood.user_id,
            mood.mood,
            mood.date,
            mood.created_at,
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
        date: mood.date,
        created_at: mood.created_at,
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
  