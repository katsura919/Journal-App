import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert, Platform } from "react-native";

// Configure the notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Request notification permissions
export const requestNotificationPermissions = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      Alert.alert("Permission Denied", "Push notifications won't work without permission.");
      return;
    }
  } else {
    Alert.alert("Unsupported Device", "Must use a physical device for push notifications.");
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
    });
  }
};

// Schedule a notification
export const scheduleNotification = async (time) => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync(); // Clear existing notifications
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Journal Reminder",
        body: "Don't forget to write in your journal today!",
      },
      trigger: {
        hour: time.getHours(),
        minute: time.getMinutes(),
        repeats: true, // Repeat daily
      },
    });

    await AsyncStorage.setItem("reminderTime", JSON.stringify(time)); // Save the reminder time
    Alert.alert(
      "Reminder Scheduled",
      `You'll be reminded daily at ${time.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}.`
    );
  } catch (error) {
    console.error("Failed to schedule notification:", error);
    Alert.alert("Error", "Failed to schedule the notification. Please try again.");
  }
};

// Load the saved reminder time
export const loadReminderTime = async () => {
  try {
    const savedTime = await AsyncStorage.getItem("reminderTime");
    return savedTime ? new Date(JSON.parse(savedTime)) : null;
  } catch (error) {
    console.error("Failed to load reminder time:", error);
    return null;
  }
};
