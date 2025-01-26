import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo
import { syncIfOnline } from './utils/syncUtils'; // Import the sync utility

const CreateJournal = ({ navigation }) => {
  const db = useSQLiteContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSaveJournal = async () => {
    if (!title || !content) {
      Alert.alert('Validation Error', 'Title and Content are required.');
      return;
    }

    try {
      // Fetch user_id from AsyncStorage
      const userId = await AsyncStorage.getItem('userId');

      if (!userId) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        return;
      }

      const createdAt = new Date().toISOString();
      const updatedAt = new Date().toISOString();

      // Insert journal entry into the database
      await db.runAsync(
        'INSERT INTO journal_entries (user_id, title, content, created_at, updated_at, journal_status, sync_status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [userId, title, content, createdAt, updatedAt,'active', 'pending'] // 'pending' as default sync status
      );

      // Reset fields after adding the journal entry
      setTitle('');
      setContent('');
      Alert.alert('Success', 'Journal entry created!');

      // Check if the device is online
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        try {
          await syncIfOnline(userId, db); // Call the sync function
          Alert.alert('Success', 'Data synchronized with the server!');
        } catch (syncError) {
          console.error('Error during synchronization:', syncError);
          Alert.alert('Error', 'Failed to synchronize data. It will be retried later.');
        }
      } else {
        console.log('Offline: Sync will be retried later.');
      }

      navigation.goBack(); // Navigate back after saving the entry
    } catch (error) {
      console.error('Error inserting journal entry:', error);
      Alert.alert('Error', 'Failed to save journal entry.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Create Journal Entry</Text>

      <TextInput
        style={styles.input}
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
      />

      <TextInput
        style={styles.textarea}
        placeholder="Content"
        value={content}
        onChangeText={setContent}
        multiline
      />

      <Button title="Save Journal" onPress={handleSaveJournal} />
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
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
  },
  textarea: {
    height: 150,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    paddingTop: 10,
    borderRadius: 5,
    textAlignVertical: 'top',
  },
});

export default CreateJournal;
