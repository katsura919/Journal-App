// DaysList.js
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const DaysList = ({ generateDaysData, addOrEditMood, getMoodEmoji }) => {
  return (
    <FlatList
      data={generateDaysData()}
      numColumns={7}
      keyExtractor={(item, index) => (item ? item.dateKey : index.toString())}
      renderItem={({ item }) =>
        item ? (
          <TouchableOpacity
            style={[
              styles.day,
              item.isToday && styles.today,
              item.mood ? styles.filledDay : styles.emptyDay,
            ]}
            onPress={() => addOrEditMood(item.dateKey)}
          >
            <Text style={styles.dayText}>{getMoodEmoji(item.mood)}</Text>
            <Text style={styles.dateText}>{item.day}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.day} />
        )
      }
      contentContainerStyle={styles.flatListContainer} // Added style for the container
    />
  );
};

const styles = StyleSheet.create({
  day: {
    width: "13%", // This keeps the day element at 1/7th of the total width
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 25,
    margin: 2, // Adding margin for the gap
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
  flatListContainer: {
    flexGrow: 1, // Ensures FlatList takes up the remaining space
    justifyContent: "center", // Aligns items in the center of the container
    paddingHorizontal: 10, // Optional: You can add padding here if needed
  },
});

export default DaysList;
