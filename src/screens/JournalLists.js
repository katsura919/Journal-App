import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { useSQLiteContext } from 'expo-sqlite'; 
import AsyncStorage from '@react-native-async-storage/async-storage';

const JournalList = ({ navigation }) => {
  const db = useSQLiteContext(); // Get the SQLite database context
  const [journalEntries, setJournalEntries] = useState([]);
  
  
  useFocusEffect(
    React.useCallback(() => {
      const loadEntries = async () => {
        try {
          const userId = await AsyncStorage.getItem('userId');

          if (!userId) {
            Alert.alert('Error', 'User ID not found. Please log in again.');
            return;
          }

          // Query the SQLite database to get journal entries for the current user
          const result = await db.getAllAsync(
            'SELECT * FROM journal_entries WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
          );

          setJournalEntries(result); // Set the entries to the state
        } catch (error) {
          console.error('Error loading journal entries:', error);
          Alert.alert('Error', 'Failed to load journal entries.');
        }
      };

      loadEntries();
    }, []) // Empty dependency array ensures the effect runs on focus
  );

  // Handle journal entry click
  const handleViewJournal = (item) => {
    navigation.navigate('ViewJournal', { journal: item });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Journal Entries</Text>

      <FlatList
        data={journalEntries}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.entry} onPress={() => handleViewJournal(item)}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            <Text style={styles.content}>{item.content.slice(0, 100)}...</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.entry_id.toString()} // Use entry_id as the key
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  entry: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: '#888',
  },
  content: {
    fontSize: 16,
    color: '#333',
  },
});

export default JournalList;
