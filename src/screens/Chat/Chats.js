import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import Markdown from "react-native-markdown-display";

const ChatScreen = () => {
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]); // Stores the conversation history

  const sendMessageToMark = async () => {
    if (!userInput.trim()) return;

    // Add user's message to the messages list
    const userMessage = { role: "user", message: userInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    try {
      const res = await fetch("http://10.0.2.2:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput }),
      });

      const data = await res.json();
      const markMessage = { role: "mark", message: data.response };

      // Add Mark's response to the messages list
      setMessages((prevMessages) => [...prevMessages, markMessage]);
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        role: "mark",
        message: "An error occurred. Please try again.",
      };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    }

    setUserInput(""); // Clear the input field
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.markMessage,
        ]}
      >
        {isUser ? (
          <Text style={styles.messageText}>{item.message}</Text>
        ) : (
          <Markdown style={styles.markdown}>{item.message}</Markdown>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
      />

      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type your message..."
          value={userInput}
          onChangeText={setUserInput}
          style={styles.input}
        />
        <Button title="Send" onPress={sendMessageToMark} />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  chatContainer: {
    padding: 10,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 15,
    padding: 10,
    marginVertical: 5,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#d1f7c4",
  },
  markMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e1e1e1",
  },
  messageText: {
    fontSize: 16,
  },
  markdown: {
    body: { fontSize: 16 },
    text: { color: "#000" },
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
});

export default ChatScreen;
