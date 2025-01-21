import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';  // Import Ionicons for the back button
import { useSQLiteContext } from 'expo-sqlite'; // Assuming you are using expo-sqlite for database access

const ViewJournal = ({ route, navigation }) => {
  const { journal } = route.params;  // Get the journal data passed from JournalList or ViewJournal screen
  const [title, setTitle] = useState(journal.title);
  const [content, setContent] = useState(journal.content);
  const db = useSQLiteContext(); // Get the SQLite database context

  // Save the edited journal to SQLite
  const handleSave = async () => {
    if (!title || !content) {
      Alert.alert('Error', 'Title and content cannot be empty.');
      return;
    }

    try {
      const updatedAt = new Date().toISOString();

      // Update the journal entry in the database
      await db.runAsync(
        'UPDATE journal_entries SET title = ?, content = ?, updated_at = ? WHERE entry_id = ?',
        [title, content, updatedAt, journal.entry_id]  // Use entry_id to update specific journal
      );

      Alert.alert('Success', 'Journal updated successfully!');
      navigation.goBack();  // Go back to the previous screen
    } catch (error) {
      console.error('Error saving edited journal:', error);
      Alert.alert('Error', 'Failed to save the journal.');
    }
  };

  // Delete the journal entry
  const handleDelete = async () => {
    try {
      await db.runAsync(
        'UPDATE journal_entries SET sync_status = ? WHERE journal_id = ?',
        ['deleted', journalId]  // Mark the entry as deleted in the local database
      );

      Alert.alert('Success', 'Journal deleted successfully!');
      navigation.goBack();  // Navigate back after deletion
    } catch (error) {
      console.error('Error deleting journal:', error);
      Alert.alert('Error', 'Failed to delete the journal.');
    }
  };

  // Handle dismiss keyboard when tapping outside input fields
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={dismissKeyboard}>
      <View style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        <Text style={styles.header}>Edit Journal</Text>

        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Journal Title"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          value={content}
          onChangeText={setContent}
          placeholder="Journal Content"
          multiline
          numberOfLines={5}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete Journal</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 10,
    zIndex: 1,  // Ensure the back button is on top of other elements
    padding: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 150,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#f44336', // Red color for delete
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 15,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ViewJournal;
