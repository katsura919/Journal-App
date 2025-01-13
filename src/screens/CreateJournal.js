import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // If you want to store entries locally or replace with your SQLite logic

const CreateJournal = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleSaveJournal = async () => {
    if (!title || !content) {
      Alert.alert('Validation Error', 'Title and Content are required.');
      return;
    }

    try {
      // Retrieve the user_id from AsyncStorage (or other storage)
      const user_id = await AsyncStorage.getItem('userId');

      if (!user_id) {
        Alert.alert('Error', 'User ID not found. Please log in again.');
        return;
      }

      const journalEntry = {
        user_id, // Include user_id in the journal entry
        title,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_synced: false, // Assuming the entry is not synced initially
      };

      // Save the journal entry to AsyncStorage or your SQLite database
      const existingEntries = JSON.parse(await AsyncStorage.getItem('journalEntries')) || [];
      existingEntries.push(journalEntry);
      await AsyncStorage.setItem('journalEntries', JSON.stringify(existingEntries));

      Alert.alert('Success', 'Journal entry created!');
      setTitle('');
      setContent('');
      navigation.goBack(); // Navigate back after saving the entry
    } catch (error) {
      console.error('Error saving journal entry:', error);
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
