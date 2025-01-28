// Profile.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSQLiteContext } from "expo-sqlite";
import MoodSelectorModal from "./components/MoodSelectorModal";
import DaysList from "./components/DaysList";

const Insights = () => {
  const db = useSQLiteContext();
  const [userId, setUserId] = useState(null);
  const [moodEntries, setMoodEntries] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentMood, setCurrentMood] = useState("");

  useEffect(() => {
    const fetchUserId = async () => {
      const storedUserId = await AsyncStorage.getItem("userId");
      setUserId(storedUserId);
    };

    fetchUserId();
  }, []);

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
        [dateLike, userId]
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

  const generateDaysData = () => {
    const daysInMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay();
    const days = [];
    const today = new Date().toISOString().split("T")[0];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const entry = moodEntries.find((entry) => entry.date === dateKey);
      const mood = entry ? entry.mood : null;
      const isToday = dateKey === today;

      days.push({ dateKey, day, mood, isToday });
    }

    return days;
  };

  const addOrEditMood = (date) => {
    const existingEntry = moodEntries.find((entry) => entry.date === date);
    setSelectedDate(date);

    if (!existingEntry) {
      setCurrentMood(""); 
      setShowModal(true);
    } else {
      setCurrentMood(existingEntry.mood); 
      setShowModal(true);
    }
  };

  const saveMood = async () => {
    if (currentMood) {
      try {
        if (moodEntries.some((entry) => entry.date === selectedDate)) {
          await db.runAsync(
            "UPDATE moods SET mood = ? WHERE date = ? AND user_id = ?",
            [currentMood, selectedDate, userId]
          );
        } else {
          await db.runAsync(
            "INSERT INTO moods (user_id, date, mood) VALUES (?, ?, ?)",
            [userId, selectedDate, currentMood]
          );
        }

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

      setShowModal(false); 
    } else {
      alert("Please select a mood.");
    }
  };

  const cancelMood = () => {
    setShowModal(false); 
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#4CAF50" />
      ) : (
        <View style={styles.contentWrapper}>


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

          {/* Render the DaysList component */}
          <DaysList generateDaysData={generateDaysData} addOrEditMood={addOrEditMood} getMoodEmoji={getMoodEmoji} />
          
          {/* Render the MoodSelectorModal component */}
          <MoodSelectorModal
            visible={showModal}
            currentMood={currentMood}
            setCurrentMood={setCurrentMood}
            saveMood={saveMood}
            cancelMood={cancelMood}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#1c1c1c",
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
});

export default Insights;
