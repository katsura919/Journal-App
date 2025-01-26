import React, { useEffect } from 'react';
import AppNavigator from './src/AppNavigator';
import { SQLiteProvider } from 'expo-sqlite';

const App = () => {

  const initializeDatabase = async (db) => {
    try {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        
        CREATE TABLE IF NOT EXISTS journal_entries (
            entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            deleted_at TEXT,
            version INTEGER,
            sync_status TEXT
          );
        
        CREATE TABLE IF NOT EXISTS moods (
            mood_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            mood TEXT,  
            date TEXT,  -- Store the date in 'YYYY-MM-DD' format
            created_at TEXT
          );
      `);
      console.log('Database initialized!');
    } catch (error) {
      console.log('Error while initializing the database:', error);
    }
  };
  return (
    <SQLiteProvider databaseName='auth.db' onInit={initializeDatabase}>
      <AppNavigator />
    </SQLiteProvider>
  );
};

export default App;
