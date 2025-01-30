import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo'; // Import NetInfo
import { syncIfOnline } from '../../utils/syncUtils'; // Import the sync utility

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
      <View style={styles.headerContainer}>
          <Text style={styles.headerText}>
              Create Journal
          </Text>
        </View>
      <View style={styles.inputsContainer}>
          <TextInput
            style={styles.input}
            placeholder="Title"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            style={styles.textarea}
            placeholder="Content"
            placeholderTextColor="#888"
            value={content}
            onChangeText={setContent}
            multiline
          />
      </View>
      

      <Button title="Save Journal" onPress={handleSaveJournal} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1c1c1c'
  },
  headerContainer:{
    marginTop: 20,
  },  
  headerText:{
    fontSize: 20,
    color: '#d4d5d4'
  },
  inputsContainer:{
    width: '100%',
    padding: 20
   
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#60ae73',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    borderRadius: 5,
    color: '#d4d5d4',
    borderRadius: 20,
  },
  textarea: {
    width: '100%',
    height: 150,
    borderColor: '#60ae73',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    paddingTop: 10,
    borderRadius: 5,
    textAlignVertical: 'top',
    borderRadius: 20,
  },
});

export default CreateJournal;
