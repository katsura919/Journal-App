import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import axios from 'axios';

const Register = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');

  const handleRegister = async () => {
    try {
      const response = await axios.post('http://10.0.2.2:5000/auth/register', {
        username,
        email,
        password,
        firstname,
        lastname,
      });

      Alert.alert('Registration Successful', response.data.message);
      navigation.navigate('Login'); // Navigate to Login screen
    } catch (error) {
      Alert.alert('Registration Failed', error.response?.data?.error || 'An error occurred during registration');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <TextInput
        style={styles.input}
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstname}
        onChangeText={setFirstname}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastname}
        onChangeText={setLastname}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Register" onPress={handleRegister} />
      <Text
        style={styles.link}
        onPress={() => navigation.navigate('Login')}>
        Already have an account? Login
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  link: { color: 'blue', marginTop: 15, textAlign: 'center' },
});

export default Register;
