// MoodSelector.js
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

const MoodSelector = ({ handleMoodSelect }) => {
  return (
    <View style={styles.moodContainer}>
      <TouchableOpacity
        style={[styles.moodButton, { backgroundColor: '#FF6347' }]}
        onPress={() => handleMoodSelect('happy')}
      >
        <Text style={styles.moodText}>😊</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.moodButton, { backgroundColor: '#32CD32' }]}
        onPress={() => handleMoodSelect('excited')}
      >
        <Text style={styles.moodText}>😃</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.moodButton, { backgroundColor: '#FFD700' }]}
        onPress={() => handleMoodSelect('neutral')}
      >
        <Text style={styles.moodText}>😐</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.moodButton, { backgroundColor: '#1E90FF' }]}
        onPress={() => handleMoodSelect('sad')}
      >
        <Text style={styles.moodText}>😢</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.moodButton, { backgroundColor: '#8B0000' }]}
        onPress={() => handleMoodSelect('angry')}
      >
        <Text style={styles.moodText}>😡</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 10,
  },
  moodButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  moodText: {
    fontSize: 30,
  },
});

export default MoodSelector;
