import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';  // Import useFocusEffect
import AsyncStorage from '@react-native-async-storage/async-storage';

const JournalList = ({ navigation }) => {
  const [journalEntries, setJournalEntries] = useState([]);

  // Load journal entries from AsyncStorage when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const loadEntries = async () => {
        try {
          // Replace with the actual current user's ID from your auth logic
          const currentUserId = await AsyncStorage.getItem('userId');
          
          const entries = JSON.parse(await AsyncStorage.getItem('journalEntries')) || [];
          // Filter entries by the current user's ID
          const userEntries = entries.filter(entry => entry.user_id === currentUserId);
          
          setJournalEntries(userEntries);
        } catch (error) {
          console.error('Error loading journal entries:', error);
          Alert.alert('Error', 'Failed to load journal entries.');
        }
      };
  
      loadEntries();
    }, []) // Empty dependency array ensures the effect runs on focus
  );
  

  // Navigate to create journal screen
  const handleAddJournal = () => {
    navigation.navigate('CreateJournal');
  };

  // Handle journal entry click
  const handleViewJournal = (item) => {
    navigation.navigate('ViewJournal', { journal: item });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Journal Entries</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddJournal}>
        <Text style={styles.addButtonText}>+ Add New Journal</Text>
      </TouchableOpacity>

      <FlatList
        data={journalEntries}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.entry} onPress={() => handleViewJournal(item)}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.title}>{item.user_id}</Text>
            <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
            <Text style={styles.content}>{item.content.slice(0, 100)}...</Text>
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
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
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
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
