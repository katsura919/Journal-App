// MoodSelectorModal.js
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View, Button } from "react-native";

const MoodSelectorModal = ({ visible, currentMood, setCurrentMood, saveMood, cancelMood }) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={cancelMood}>
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Mood</Text>
          <TouchableOpacity onPress={() => setCurrentMood("happy")}>
            <Text style={styles.modalButton}>😄 Happy</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentMood("neutral")}>
            <Text style={styles.modalButton}>😐 Neutral</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCurrentMood("sad")}>
            <Text style={styles.modalButton}>😢 Sad</Text>
          </TouchableOpacity>

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
  },
  modalTitle: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  modalButton: {
    fontSize: 18,
    padding: 10,
    textAlign: "center",
    marginVertical: 5,
  },
  modalActions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});

export default MoodSelectorModal;
