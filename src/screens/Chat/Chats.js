import React, { useState } from "react";
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { useTheme, themes } from "../../context/ThemeContext.js";
import { Ionicons } from "@expo/vector-icons";

const Chats = () => {
  const localAPI = 'http://10.0.2.2:5000'
  const deployAPI = 'https://journal-server-ot0w.onrender.com'
  const { theme } = useTheme();
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typingMessage, setTypingMessage] = useState("");

  const sendMessageToMark = async () => {
    if (!userInput.trim()) return;

    const userMessage = { role: "user", message: userInput };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    setIsLoading(true);
    setUserInput("");

    try {
      const res = await fetch(`${deployAPI}/api/chat`, {
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
        }
      }, 30);
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
      setMessages((prevMessages) => [...prevMessages, { role: "mark", message: "An error occurred. Please try again." }]);
    }
  };

  const renderMessage = ({ item }) => {
    const isUser = item.role === "user";
    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.markMessage,
          { backgroundColor: themes[theme]?.messageBackground, borderColor: themes[theme]?.border },
        ]}
      >
        {isUser ? (
          <Text style={[styles.messageText, { color: themes[theme]?.text }]}>{item.message}</Text>
        ) : (
          <Markdown style={styles.markdown}>{item.message}</Markdown>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor: themes[theme]?.background }]}
    >
      <FlatList
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContainer}
        ListEmptyComponent={<Text style={[styles.promptText, { color: themes[theme]?.textSecondary }]}>What do you want to talk about?</Text>}
      />

      {isLoading && (
        <View style={styles.typingContainer}>
          <Text style={[styles.typingText, { color: themes[theme]?.textSecondary }]}>Typing</Text>
          <View style={styles.dotsContainer}>
            <ActivityIndicator size="small" color={themes[theme]?.accent} />
          </View>
        </View>
      )}

      {typingMessage && (
        <View style={[styles.messageContainer, styles.markMessage]}>
          <Markdown style={styles.markdown}>{typingMessage}</Markdown>
        </View>
      )}

      <View style={[styles.inputContainer, { backgroundColor: themes[theme]?.inputBackground }]}>        
        <TextInput
          placeholder="Type your message..."
          placeholderTextColor={themes[theme]?.textSecondary}
          value={userInput}
          onChangeText={setUserInput}
          style={[styles.input, { color: themes[theme]?.text, borderColor: themes[theme]?.border }]}
        />
        <TouchableOpacity onPress={sendMessageToMark} style={[styles.sendButton, { backgroundColor: themes[theme]?.accent }]}>          
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    borderWidth: 1,
  },
  userMessage: {
    alignSelf: "flex-end",
  },
  markMessage: {
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 16,
  },
  markdown: {
    body: { fontSize: 16 },
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  promptText: {
    textAlign: "center",
    fontSize: 18,
    marginTop: 20,
  },
  typingContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  typingText: {
    fontSize: 16,
    marginRight: 5,
  },
  dotsContainer: {
    flexDirection: "row",
  },
});

export default Chats;