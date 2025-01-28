import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, StatusBar, TouchableOpacity } from 'react-native';
import LottieView from 'lottie-react-native'; // Import LottieView
import { getMoodForToday, saveMood } from './utils/moodUtils';
import { useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { syncIfOnline, syncMoodsIfOnline } from './utils/syncUtils';
import MoodSelector from './components/MoodSelector.js';

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
      const checkMood = async () => {
        const exists = await getMoodForToday(userId, db);
        setMoodEntryExists(exists);
        setLoading(false);
      };
      checkMood();
    }
  }, [userId, db]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user_id = await AsyncStorage.getItem('userId');
        const firstname = await AsyncStorage.getItem('firstname');
        const lastname = await AsyncStorage.getItem('lastname');

        if (user_id && firstname && lastname) {
          setUserData({ user_id, firstname, lastname });

          const unsubscribe = NetInfo.addEventListener(async (state) => {
            console.log('Network state changed:', state.isConnected ? 'Online' : 'Offline');
            setInternet(state.isConnected ? 'Online' : 'Offline');

            if (state.isConnected) {
              try {
                await syncIfOnline(user_id, db);
                await syncMoodsIfOnline(user_id, db);
                Alert.alert('Success', 'Data synchronization completed successfully!');
              } catch (error) {
                console.error('Error during synchronization Home:', error);
                Alert.alert('Error', 'An error occurred during synchronization. Please try again.');
              }
            }
          });

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
    if (userId && db) {
      await saveMood(userId, mood, db);
      setMoodEntryExists(true);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={styles.container}>
      <StatusBar />
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Home</Text>
      </View>

      <View style={styles.lottieIcon}>
      <TouchableOpacity onPress={() => navigation.navigate('Chats')}>
        <LottieView
          source={require('../../assets/animations/chat.json')} // Your Lottie JSON file
          autoPlay
          loop
          style={styles.lottieIcon}
        />
      </TouchableOpacity>
      </View>

      {!moodEntryExists && (
        <View style={styles.moodContainer}>
          <Text style={styles.text}>How are you feeling today?</Text>
          <MoodSelector handleMoodSelect={handleMoodSelect} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
  },
  headerContainer: {
    marginTop: 20,
  },
  headerText: {
    fontSize: 20,
    color: '#d4d5d4',
  },
  lottieIcon: {
    width: 90,
    height: 90,
    position: 'absolute',
    top: -6,
    right: -10
  },
  moodContainer: {
    borderWidth: 1,
    borderColor: '#60ae73',
    borderRadius: 20,
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 10,
    padding: 15,
    marginTop: 20,
  },
  text: {
    fontSize: 18,
    color: '#d4d5d4',
  },
});

export default Home;
