import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme, themes } from "../../context/ThemeContext.js";
import { startRecording, stopRecording, uploadAudio } from "../../utils/audiotUtils.js"; // Import the functions
import * as Speech from "expo-speech"; // Import Expo Speech API
import axios from "axios"; // Import Axios for API requests

const VoiceChats = () => {
  const { theme } = useTheme();
  const [recording, setRecording] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [isResponding, setIsResponding] = useState(false); // To track if the AI is responding
  const [aiResponse, setAiResponse] = useState(""); // Store AI response
  console.log(aiResponse)
  // Function to send the transcription to the AI API and convert the response to speech
  const sendTranscriptionToAI = async (transcription) => {
    if (!transcription.trim()) return;

    setIsResponding(true); // Indicate that AI is responding

    try {
      // Use axios to send the transcription to the AI API
      const response = await axios.post("https://journal-server-ot0w.onrender.com/api/chat", {
        userInput: transcription,
      });

      const aiResponse = response.data.response;
      setAiResponse(aiResponse); // Store AI response

      // Convert the AI response to speech
      Speech.speak(aiResponse, {
        language: "en",
        pitch: 1,
        rate: 1,
      });

      setIsResponding(false); // Stop the "AI is responding" indicator
    } catch (error) {
      console.error("Error:", error);

      // Show an alert and provide a fallback response if the API request fails
      setIsResponding(false);
      Alert.alert("Error", "Something went wrong while contacting the AI. Please try again.");
      
      // Provide a fallback response to avoid complete silence
      Speech.speak("Sorry, I couldn't reach the AI. Please try again later.", {
        language: "en",
        pitch: 1,
        rate: 1,
      });
    }
  };

  useEffect(() => {
    if (transcription && !isResponding) {
      sendTranscriptionToAI(transcription); // Send transcription when available
    }
  }, [transcription]);

  // Manual trigger for speech playback
  const playAudio = () => {
    if (aiResponse) {
      Speech.speak(aiResponse, {
        language: "en",
        pitch: 1,
        rate: 1,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themes[theme]?.background }]}>
      <Text style={[styles.title, { color: themes[theme]?.text }]}>Talk to AI</Text>

      <View style={styles.transcriptionBox}>
        <Text style={[styles.transcriptionText, { color: themes[theme]?.text }]}>
          {transcription || "Press the mic and start talking..."}
        </Text>
      </View>

      {isUploading && <ActivityIndicator size="large" color={themes[theme]?.accent} />}
      {isResponding && <ActivityIndicator size="small" color={themes[theme]?.accent} />}

      <TouchableOpacity
        style={[styles.micButton, { backgroundColor: recording ? "red" : themes[theme]?.accent }]}
        onPress={recording ? () => stopRecording(recording, setTranscription, setIsUploading) : () => startRecording(setRecording)}
      >
        <Ionicons name={recording ? "stop-circle" : "mic"} size={40} color="white" />
      </TouchableOpacity>

      {/* Button to manually trigger speech playback */}
      {aiResponse && (
        <TouchableOpacity style={styles.speakButton} onPress={playAudio}>
          <Text style={styles.speakButtonText}>Play AI Response</Text>
        </TouchableOpacity>
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
  speakButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  speakButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default VoiceChats;
