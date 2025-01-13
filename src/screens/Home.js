import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useNetworkStatus from '../services/connectivity';  
const Home = ({ navigation }) => {
  const [userData, setUserData] = useState({
    user_id: null,
    firstname: '',
    lastname: '',
  });

  const { isOnline, connected } = useNetworkStatus(userData.user_id);  // Get network status and WebSocket connection status

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user_id = await AsyncStorage.getItem('userId');
        const firstname = await AsyncStorage.getItem('firstname');
        const lastname = await AsyncStorage.getItem('lastname');

        // Check if values exist in AsyncStorage and update state
        if (user_id && firstname && lastname) {
          setUserData({ user_id, firstname, lastname });
        } else {
          Alert.alert('Error', 'User data is missing. Please log in again.');
        }
      } catch (error) {
        console.error('Error fetching user data from AsyncStorage:', error);
        Alert.alert('Error', 'An error occurred while fetching user data.');
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (!isOnline) {
     
    }
  }, [isOnline]);

  const handleLogout = async () => {
    try {
      // Clear the token and other user data, then navigate to the Login screen
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('user_id');
      await AsyncStorage.removeItem('firstname');
      await AsyncStorage.removeItem('lastname');

      Alert.alert('Logged Out', 'You have been logged out successfully.');
      navigation.replace('Login');
    } catch (error) {
      Alert.alert('Error', 'An error occurred while logging out.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to AI Journal!</Text>
      {userData.user_id && (
        <>
          <Text style={styles.userInfo}>User ID: {userData.user_id}</Text>
          <Text style={styles.userInfo}>First Name: {userData.firstname}</Text>
          <Text style={styles.userInfo}>Last Name: {userData.lastname}</Text>
        </>
      )}
      <Button title="Logout" onPress={handleLogout} />
      {isOnline ? (
        <Text style={styles.status}>Connected to the internet!</Text>
      ) : (
        <Text style={styles.status}>No internet connection. Reconnecting...</Text>
      )}
      {connected ? (
        <Text style={styles.status}>WebSocket connected!</Text>
      ) : (
        <Text style={styles.status}>WebSocket not connected.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  userInfo: { fontSize: 18, marginBottom: 10, textAlign: 'center' },
  status: { fontSize: 16, marginTop: 20, textAlign: 'center' },
});

export default Home;
