import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Modal, Button } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Profile = () => {
  const db = useSQLiteContext();
  const [userId, setUserId] = useState(null); // Add state to store the userId
  const [moodEntries, setMoodEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMood, setCurrentMood] = useState("");
  console.log(moodEntries)
  // Fetch userId from AsyncStorage
  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(storedUserId); // Set the userId state
    };

    fetchUserId();
  }, []);

  // Fetch mood entries for the current user
  useEffect(() => {
    if (userId) {
      fetchMoodEntries();
    }
  }, [selectedMonth, userId]);

  const fetchMoodEntries = async () => {
    const year = selectedMonth.getFullYear();
    const month = String(selectedMonth.getMonth() + 1).padStart(2, "0");
    const dateLike = `${year}-${month}-%`;

    try {
      const result = await db.getAllAsync(
        "SELECT * FROM moods WHERE date LIKE ? AND user_id = ? ORDER BY created_at DESC",
        [dateLike, userId] // Pass user_id in query
      );
      setMoodEntries(result);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case "happy":
        return "😄";
      case "neutral":
        return "😐";
      case "sad":
        return "😢";
      default:
        return "➕";
    }
  };

  const renderDays = () => {
    const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay();
    const days = [];
    const today = new Date().toISOString().split("T")[0];

    // Add empty slots for days before the 1st of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(<View key={`empty-${i}`} style={styles.day} />);
    }

    // Render actual days with mood data
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const entry = moodEntries.find((entry) => entry.date === dateKey);
      const mood = entry ? entry.mood : null;
      const isToday = dateKey === today;

      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.day,
            isToday && styles.today,
            mood ? styles.filledDay : styles.emptyDay,
          ]}
          onPress={() => addOrEditMood(dateKey)}
        >
          <Text style={styles.dayText}>{getMoodEmoji(mood)}</Text>
          <Text style={styles.dateText}>{day}</Text>
        </TouchableOpacity>
      );
    }

    return days;
  };

  const addOrEditMood = async (date) => {
    const existingEntry = moodEntries.find((entry) => entry.date === date);
    setSelectedDate(date);

    if (!existingEntry) {
      setCurrentMood(""); // Reset mood if adding a new one
      setShowModal(true); // Open modal to select mood for the day
    } else {
      setCurrentMood(existingEntry.mood); // Pre-fill existing mood for editing
      setShowModal(true); // Open modal to edit the mood
    }
  };

  const saveMood = async () => {
    if (currentMood) {
      try {
        if (moodEntries.some((entry) => entry.date === selectedDate)) {
          await db.runAsync(
            "UPDATE moods SET mood = ? WHERE date = ? AND user_id = ?",
            [currentMood, selectedDate, userId] // Pass userId in query
          );
        } else {
          await db.runAsync(
            "INSERT INTO moods (user_id, date, mood) VALUES (?, ?, ?)",
            [userId, selectedDate, currentMood] // Pass userId in query
          );
        }

        // Update the local state
        setMoodEntries((prevEntries) =>
          prevEntries.map((entry) =>
            entry.date === selectedDate ? { ...entry, mood: currentMood } : entry
          )
        );
        alert("Mood saved successfully!");
      } catch (error) {
        console.error("Error saving mood:", error);
        alert("Failed to save mood.");
      }

      setShowModal(false); // Close the modal after saving
    } else {
      alert("Please select a mood.");
    }
  };

  const cancelMood = () => {
    setShowModal(false); // Close the modal without saving
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))} >
              <Text style={styles.navText}>{"<"}</Text>
            </TouchableOpacity>
            <Text style={styles.monthText}>
              {selectedMonth.toLocaleString("default", { month: "long" })} {selectedMonth.getFullYear()}
            </Text>
            <TouchableOpacity onPress={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))} >
              <Text style={styles.navText}>{">"}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.calendar}>{renderDays()}</View>

          {/* Modal for selecting mood */}
          <Modal
            visible={showModal}
            animationType="slide"
            transparent={true}
            onRequestClose={cancelMood}
          >
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
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginTop: 30,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  navText: {
    color: "#fff",
    fontSize: 20,
  },
  monthText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  calendar: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  day: {
    width: "13%",
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 5,
    borderRadius: 25,
  },
  emptyDay: {
    backgroundColor: "#333",
  },
  filledDay: {
    backgroundColor: "#4CAF50",
  },
  today: {
    borderWidth: 2,
    borderColor: "#FFD700",
  },
  dayText: {
    color: "#fff",
    fontSize: 18,
  },
  dateText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 5,
  },
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

export default Profile;
