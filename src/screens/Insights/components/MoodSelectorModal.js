import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, Button } from "react-native";

const MoodSelectorModal = ({ visible, currentMood, setCurrentMood, saveMood, cancelMood }) => {
  // Define mood options with emojis
  const moodOptions = [
    { mood: "happy", emoji: "😄", label: "Happy" },
    { mood: "excited", emoji: "😃", label: "Excited" },
    { mood: "neutral", emoji: "😐", label: "Neutral" },
    { mood: "sad", emoji: "😢", label: "Sad" },
    { mood: "angry", emoji: "😡", label: "Angry" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={cancelMood}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Mood</Text>

          {/* Emoji Row */}
          <View style={styles.emojiRow}>
            {moodOptions.map((option) => (
              <TouchableOpacity
                key={option.mood}
                onPress={() => setCurrentMood(option.mood)}
                style={[
                  styles.emojiButton,
                  currentMood === option.mood && styles.selectedEmojiButton, // Highlight selected emoji
                ]}
              >
                <Text style={styles.emojiText}>{option.emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>


          {/* Save and Cancel Buttons */}
          <View style={styles.modalActions}>
            <Button title="Cancel" onPress={cancelMood} />
            <Button title="Save" onPress={saveMood} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  emojiButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  selectedEmojiButton: {
    backgroundColor: "#d1e8ff", // Highlight color for selected emoji
    borderWidth: 2,
    borderColor: "#007BFF",
  },
  emojiText: {
    fontSize: 24,
  },
  selectedMoodText: {
    fontSize: 16,
    marginBottom: 20,
    color: "#007BFF",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});

export default MoodSelectorModal;