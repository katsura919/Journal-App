import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, themes } from "../../context/ThemeContext.js";
import { startRecording, stopRecording } from "../../utils/audiotUtils.js"; // Import the functions
import * as Speech from "expo-speech"; // Import Expo Speech API
import axios from "axios"; // Import Axios for API requests

const VoiceChats = () => {
  const { theme } = useTheme();
  const [recording, setRecording] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Track loading state for AI response
  const [typingMessage, setTypingMessage] = useState(""); // Track typing effect
  const [messages, setMessages] = useState([]); // Store messages

  // Function to send the message to the AI (reusing the sendMessageToMark logic)
  const sendMessageToMark = async (userInput) => {
    if (!userInput.trim()) return;

    const userMessage = { role: "user", message: userInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setIsLoading(true);

    try {
      const res = await fetch("http://10.0.2.2:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });

      const data = await res.json();
      const markMessage = { role: "mark", message: data.response };

      let i = 0;
      const typingInterval = setInterval(() => {
        if (i < markMessage.message.length) {
          setTypingMessage(markMessage.message.substring(0, i + 1));
          i++;
        } else {
          clearInterval(typingInterval);
          setIsLoading(false);
          setMessages((prevMessages) => [...prevMessages, markMessage]);
          setTypingMessage("");
          // Speak the response aloud
          Speech.speak(markMessage.message, { language: "en", pitch: 1, rate: 1 });
        }
      }, 30);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setMessages((prevMessages) => [...prevMessages, { role: "mark", message: "An error occurred. Please try again." }]);
      Speech.speak("Sorry, I couldn't reach the AI. Please try again later.", { language: "en", pitch: 1, rate: 1 });
    }
  };

  // Handle the recording button press and start/stop the recording
  const handleRecordButtonPress = () => {
    if (recording) {
      stopRecording(recording, setTranscription, setIsUploading);
    } else {
      startRecording(setRecording);
    }
  };

  useEffect(() => {
    if (transcription) {
      sendMessageToMark(transcription); // Send the transcription to the AI
      setTranscription(""); // Clear the transcription after sending
    }
  }, [transcription]);

  return (
    <View style={[styles.container, { backgroundColor: themes[theme]?.background }]}>
      <Text style={[styles.title, { color: themes[theme]?.text }]}>Talk to AI</Text>

      <View style={styles.transcriptionBox}>
        <Text style={[styles.transcriptionText, { color: themes[theme]?.text }]}>
          {transcription || "Press the mic and start talking..."}
        </Text>
      </View>

      {isUploading && <ActivityIndicator size="large" color={themes[theme]?.accent} />}
      {isLoading && <ActivityIndicator size="small" color={themes[theme]?.accent} />}

      <TouchableOpacity
        style={[styles.micButton, { backgroundColor: recording ? "red" : themes[theme]?.accent }]}
        onPress={handleRecordButtonPress}
      >
        <Ionicons name={recording ? "stop-circle" : "mic"} size={40} color="white" />
      </TouchableOpacity>

      {typingMessage && (
        <View style={styles.typingContainer}>
          <Text style={[styles.typingText, { color: themes[theme]?.textSecondary }]}>Typing...</Text>
          <ActivityIndicator size="small" color={themes[theme]?.accent} />
        </View>
      )}

      {messages.length > 0 && (
        <View style={styles.messagesContainer}>
          {messages.map((msg, index) => (
            <View
              key={index}
              style={[
                styles.message,
                msg.role === "user" ? styles.userMessage : styles.markMessage,
                { backgroundColor: themes[theme]?.messageBackground },
              ]}
            >
              <Text style={[styles.messageText, { color: themes[theme]?.text }]}>
                {msg.message}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  transcriptionBox: {
    width: "100%",
    minHeight: 80,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  transcriptionText: {
    fontSize: 18,
    textAlign: "center",
  },
  micButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  typingContainer: {
    marginTop: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  typingText: {
    fontSize: 16,
  },
  messagesContainer: {
    width: "100%",
    marginTop: 20,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  userMessage: {
    backgroundColor: "#d1e7dd",
    alignSelf: "flex-start",
  },
  markMessage: {
    backgroundColor: "#f8d7da",
    alignSelf: "flex-end",
  },
  messageText: {
    fontSize: 16,
  },
});

export default VoiceChats;
