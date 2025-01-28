import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useSQLiteContext } from 'expo-sqlite';
import { syncIfOnline } from './utils/syncUtils'; // Import the sync utility

const Profile = ({ navigation }) => {
  const db = useSQLiteContext(); // Initialize SQLite context
  const [internet, setInternet] = useState();
  const [userData, setUserData] = useState({
    user_id: null,
    firstname: '',
    lastname: '',
  });

  // Fetch user data and listen for network changes to sync data when online
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user_id = await AsyncStorage.getItem('userId');
        const firstname = await AsyncStorage.getItem('firstname');
        const lastname = await AsyncStorage.getItem('lastname');

        if (user_id && firstname && lastname) {
          setUserData({ user_id, firstname, lastname });

          // Start listening for network changes
          const unsubscribe = NetInfo.addEventListener(async (state) => {
            console.log("Network state changed:", state.isConnected ? "Online" : "Offline");
            setInternet(state.isConnected ? "Online" : "Offline");

            if (state.isConnected) {
              try {
                await syncIfOnline(user_id, db); // Call the sync function
                Alert.alert("Success", "Data synchronization completed successfully!");
              } catch (error) {
                console.error("Error during synchronization:", error);
                Alert.alert("Error", "An error occurred during synchronization. Please try again.");
              }
            }
          });

          // Cleanup the listener when the component unmounts
          return () => unsubscribe();
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

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userId');
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
          <Text style={styles.userInfo}>{internet}</Text>
        </>
      )}
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: 'center',
    backgroundColor: '#1c1c1c'
  },
  title: { 
    fontSize: 24, 
    marginBottom: 20, 
    textAlign: 'center',
     color: '#d4d5d4'
  },
  userInfo: { 
    fontSize: 18, 
    marginBottom: 10, 
    textAlign: 'center',
    color: '#d4d5d4'
  },
  status: { 
    fontSize: 16, 
    marginTop: 20, 
    textAlign: 'center',
    color: '#d4d5d4'
  },
});

export default Profile;
