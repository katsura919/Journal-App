import React, { useEffect } from 'react';
import AppNavigator from './src/AppNavigator';
import { SQLiteProvider } from 'expo-sqlite';

const App = () => {

  const initializeDatabase = async (db) => {
    try {
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        
          CREATE TABLE IF NOT EXISTS journal_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL, -- Link to the logged-in user
            title TEXT,
            content TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME,
            is_synced BOOLEAN DEFAULT 0
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
