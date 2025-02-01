import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { useSQLiteContext } from "expo-sqlite";

const MoodBarGraph = () => {
  const db = useSQLiteContext();
  const [moodData, setMoodData] = useState([]);

  useEffect(() => {
    fetchMoodData();
  }, []);

  const fetchMoodData = async () => {
    try {
      const result = await db.getAllAsync(
        "SELECT mood, COUNT(mood) as count FROM moods GROUP BY mood"
      );
      setMoodData(result);
    } catch (error) {
      console.error("Error fetching mood data:", error);
    }
  };

  // Define mood categories, emojis, and colors
  const moodCategories = {
    happy: { emoji: "😄", color: "#4CD964" }, // Green
    excited: { emoji: "🙂", color: "#FFD700" }, // Gold
    neutral: { emoji: "😐", color: "#FF9500" }, // Orange
    sad: { emoji: "😕", color: "#FF3B30" }, // Red
    angry: { emoji: "😠", color: "#8B0000" }, // Dark Red
  };

  // Process data to get counts for each mood
  const processData = () => {
    const counts = {};
    Object.keys(moodCategories).forEach((mood) => {
      const entry = moodData.find((item) => item.mood === mood);
      counts[mood] = entry ? entry.count : 0;
    });
    return counts;
  };

  const moodCounts = processData();

  // Find the maximum count to scale the bars
  const maxCount = Math.max(...Object.values(moodCounts));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mood Count</Text>
      <View style={styles.barContainer}>
        {Object.keys(moodCategories).map((mood) => (
          <View key={mood} style={styles.barItem}>
            {/* Bar representing the mood count */}
            <View
              style={[
                styles.bar,
                {
                  height: (moodCounts[mood] / maxCount) * 100, // Scale bar height
                  backgroundColor: moodCategories[mood].color,
                },
              ]}
            />
            {/* Emoji and count below the bar */}
            <Text style={styles.emojiText}>{moodCategories[mood].emoji}</Text>
            <Text style={styles.countText}>{moodCounts[mood]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 250,
    padding: 20,
    backgroundColor: "#ffffff",
    alignItems: "center",
    borderRadius: 20,
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000000",
    marginBottom: 20,
  },
  barContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end", // Align bars to the bottom
    width: "100%",
    height: 150, // Fixed height for the bar container
  },
  barItem: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: 30, // Width of each bar
    marginBottom: 10, // Space between bar and emoji
  },
  emojiText: {
    fontSize: 24,
  },
  countText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000000",
    marginTop: 5,
  },
});

export default MoodBarGraph;