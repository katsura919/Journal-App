import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Alert, StatusBar } from 'react-native';
import LottieView from 'lottie-react-native';
import { getMoodForToday, saveMood } from '../../utils/moodUtils.js';
import { useSQLiteContext } from 'expo-sqlite';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { syncIfOnline, syncMoodsIfOnline } from '../../utils/syncUtils.js';
import MoodSelector from './components/MoodSelector.js';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme, themes } from '../../context/ThemeContext.js'; 
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

const Home = ({ navigation }) => {
  const db = useSQLiteContext();
  const { theme, animatedBackground } = useTheme();
  const [internet, setInternet] = useState('Checking...');
  const [userData, setUserData] = useState({
    user_id: null,
    firstname: '',
    lastname: '',
  });
  const [userId, setUserId] = useState(null);
  const [moodEntryExists, setMoodEntryExists] = useState(false);
  const [loading, setLoading] = useState(true);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: animatedBackground.value,
  }));

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
    <Animated.View style={[styles.container, animatedStyle]}>
      <StatusBar />
      <View style={styles.headerContainer}>
        <Text style={[styles.headerText, { color: themes[theme]?.text || '#000' }]}>
          Welcome, {userData.firstname}!
        </Text>
        <View style={styles.networkStatus}>
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

      {!moodEntryExists && (
        <View style={styles.moodContainer}>
          <Text style={[styles.text, { color: themes[theme]?.text || '#000' }]}>
            How are you feeling today?
          </Text>
          <MoodSelector handleMoodSelect={handleMoodSelect} />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  headerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  networkStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkStatusText: {
    fontSize: 16,
    marginLeft: 5,
  },
  moodContainer: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default Home;
