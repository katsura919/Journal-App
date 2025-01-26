import React, { useState, useEffect } from 'react';
import { View, Text, Button, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { getMoodForToday, saveMood } from './utils/moodUtils';  // Import your functions
import { useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { syncIfOnline } from './utils/syncUtils'; // Import the sync utility

const Home = ({ navigation }) => {
  const db = useSQLiteContext();
   const [internet, setInternet] = useState();
    const [userData, setUserData] = useState({
      user_id: null,
      firstname: '',
      lastname: '',
    });
  const [userId, setUserId] = useState(null);
  const [moodEntryExists, setMoodEntryExists] = useState(false);
  const [loading, setLoading] = useState(true); 
  
  useEffect(() => {
    // Fetch userId from AsyncStorage
    const fetchUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        setUserId(storedUserId);
      } catch (error) {
        console.error('Error fetching userId from AsyncStorage:', error);
      }
    };

    fetchUserId();
  }, []);

  useEffect(() => {
    if (userId && db) {
      // Once userId is fetched and db is ready, check for mood entry
      const checkMood = async () => {
        const exists = await getMoodForToday(userId, db);
        setMoodEntryExists(exists);
        setLoading(false); // Stop loading once data is fetched
      };
      checkMood();
    }
  }, [userId, db]);

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
  const handleMoodSelect = async (mood) => {
    // Save the selected mood to the database
    if (userId && db) {
      await saveMood(userId, mood, db);
      setMoodEntryExists(true); // Set the state to hide the mood selection container
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      {!moodEntryExists && (
        <View>
          <Text style={styles.text}>How are you feeling today?</Text>
          <View style={styles.moodContainer}>
            <TouchableOpacity
              style={[styles.moodButton, { backgroundColor: '#FF6347' }]}
              onPress={() => handleMoodSelect('happy')}
            >
              <Text style={styles.moodText}>😊 Happy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moodButton, { backgroundColor: '#FFD700' }]}
              onPress={() => handleMoodSelect('neutral')}
            >
              <Text style={styles.moodText}>😐 Neutral</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moodButton, { backgroundColor: '#32CD32' }]}
              onPress={() => handleMoodSelect('excited')}
            >
              <Text style={styles.moodText}>😃 Excited</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moodButton, { backgroundColor: '#1E90FF' }]}
              onPress={() => handleMoodSelect('sad')}
            >
              <Text style={styles.moodText}>😢 Sad</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.moodButton, { backgroundColor: '#8B0000' }]}
              onPress={() => handleMoodSelect('angry')}
            >
              <Text style={styles.moodText}>😡 Angry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    flexWrap: 'wrap',
  },
  moodButton: {
    padding: 15,
    margin: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 120,
  },
  moodText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Home;
