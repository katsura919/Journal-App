import React, { useState, useEffect } from "react";
import { View, Button, Alert, Text } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  requestNotificationPermissions,
  scheduleNotification,
  loadReminderTime,
} from "./utils/notifications";

export default function Reminder() {
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  // Request permissions and load saved reminder time
  useEffect(() => {
    const initialize = async () => {
      await requestNotificationPermissions();
      const savedTime = await loadReminderTime();
      if (savedTime) setTime(savedTime);
    };
    initialize();
  }, []);

  const handleTimeChange = (event, selectedTime) => {
    setShowPicker(false);
    if (selectedTime) {
      setTime(selectedTime); // Update state with the new time
    }
  };

  const handleScheduleNotification = () => {
    scheduleNotification(time);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Selected Time:{" "}
        {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </Text>
      <Button title="Set Reminder Time" onPress={() => setShowPicker(true)} />
      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
      <Button
        title="Schedule Notification"
        onPress={handleScheduleNotification}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}
