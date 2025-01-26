export const getMoodForToday = async (userId, db) => {
  const today = new Date().toISOString().split('T')[0];  // 'YYYY-MM-DD' format

  try {
    // Fetching a single entry for today and the user
    const result = await db.getFirstAsync(
      'SELECT * FROM moods WHERE user_id = ? AND date = ?',
      [userId, today]
    );
    
    console.log(result);  // Log result for debugging

    // Return false if the mood entry already exists (i.e., it has already been logged)
    return result !== null;
  } catch (error) {
    console.error('Error checking mood for today:', error);
    return false;
  }
};



export const saveMood = async (userId, mood, db) => {
  const today = new Date().toISOString().split('T')[0];
  const createdAt = new Date().toISOString();
  try {
    // Inserting the mood entry into the database
    await db.runAsync(
      'INSERT INTO moods (user_id, mood, date, created_at) VALUES (?, ?, ?, ?)',
      [userId, mood, today, createdAt]
    );
    console.log('Mood saved successfully!');
  } catch (error) {
    console.error('Error saving mood:', error);
  }
};


