import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const LoginScreen = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('https://journal-server-ot0w.onrender.com/auth/login', { username, password });
      const { token, user} = response.data;

      console.log(user.user_id, user.firstname, user.lastname);
      // Save token to AsyncStorage
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', user.user_id.toString()); // Store user ID
      await AsyncStorage.setItem('firstname', user.firstname); // Store first name
      await AsyncStorage.setItem('lastname', user.lastname); // Store last name await AsyncStorage.setItem('firstname', user.firstname); // Store first name
      await AsyncStorage.setItem('lastname', user.lastname); // Store last name

      // Check if values are correctly stored
      const storedUserId = await AsyncStorage.getItem('userId');
      const storedFirstname = await AsyncStorage.getItem('firstname');
      const storedLastname = await AsyncStorage.getItem('lastname');

      console.log('Stored values:', storedUserId, storedFirstname, storedLastname);
      Alert.alert('Success', 'Login successful!');
      navigation.replace('Home'); // Navigate to HomeScreen
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Login" onPress={handleLogin} />
      <Button
        title="Register"
        onPress={() => navigation.navigate('Register')}
        color="gray"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20, borderRadius: 5 },
});

export default LoginScreen;
