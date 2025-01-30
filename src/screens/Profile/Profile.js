import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { useSQLiteContext } from 'expo-sqlite';
import { MaterialIcons } from '@expo/vector-icons'; // For icons
import { syncIfOnline } from '../../utils/syncUtils'; // Import the sync utility

const Profile = ({ navigation }) => {
  const db = useSQLiteContext(); // Initialize SQLite context
  const [internet, setInternet] = useState('Checking...');
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

  return (
    <View style={styles.container}>
      {/* Header with Settings Button */}
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <MaterialIcons name="settings" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Profile Picture */}
      <View style={styles.profilePictureContainer}>
        <Image
          source={require('../../../assets/profiles/profile.png')} // Replace with your default profile image
          style={styles.profilePicture}
        />
      </View>

      {/* User Information */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoLabel}>User ID</Text>
        <Text style={styles.userInfoText}>{userData.user_id}</Text>

        <Text style={styles.userInfoLabel}>First Name</Text>
        <Text style={styles.userInfoText}>{userData.firstname}</Text>

        <Text style={styles.userInfoLabel}>Last Name</Text>
        <Text style={styles.userInfoText}>{userData.lastname}</Text>
      </View>

      {/* Network Status */}
      <View style={styles.networkStatusContainer}>
        <MaterialIcons
          name={internet === 'Online' ? 'wifi' : 'wifi-off'}
          size={20}
          color={internet === 'Online' ? '#4CAF50' : '#F44336'}
        />
        <Text style={[styles.networkStatusText, { color: internet === 'Online' ? '#4CAF50' : '#F44336' }]}>
          {internet}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1c1c1c',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profilePictureContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#fff',
  },
  userInfoContainer: {
    backgroundColor: '#2c2c2c',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  userInfoLabel: {
    fontSize: 16,
    color: '#a0a0a0',
    marginBottom: 5,
  },
  userInfoText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 15,
  },
  networkStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  networkStatusText: {
    fontSize: 16,
    marginLeft: 10,
  },
});

export default Profile;