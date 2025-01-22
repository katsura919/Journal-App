import React, { useState } from "react";
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from "react-native";
import axios from "axios";

const ChatScreen = () => {
  const [messages, setMessages] = useState([]); // Store the chat history
  const [userInput, setUserInput] = useState(""); // Store current user input
  const [loading, setLoading] = useState(false); // Loading state

  const sendMessage = async () => {
    if (!userInput.trim()) return; // Prevent empty messages

    setLoading(true);

    // Add user message to chat history
    const newMessage = { role: "user", text: userInput };
    setMessages((prev) => [...prev, newMessage]);

    try {
      const chatData = {
        chat: userInput,
        history: messages.map((msg) => ({
          role: msg.role,
          parts: [{ text: msg.text }],  // Ensure the parts property
        })),
      };

      const response = await axios.post("http://10.0.2.2:5000/api/chat", chatData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      const botMessage = { role: "model", text: response.data.text };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
      setUserInput(""); // Clear the input
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.chatContainer}>
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.message,
              msg.role === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message..."
          value={userInput}
          onChangeText={setUserInput}
          editable={!loading}
        />
        <Button title={loading ? "..." : "Send"} onPress={sendMessage} disabled={loading} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 10,
  },
  chatContainer: {
    flex: 1,
    marginBottom: 10,
  },
  message: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0078fe",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#0078fe",
  },
  messageText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 5,
  },
  input: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    borderRadius: 5,
    marginRight: 5,
    borderWidth: 1,
    borderColor: "#ccc",
  },
});

export default ChatScreen;
