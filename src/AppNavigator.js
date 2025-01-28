import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import Login from './screens/Login';
import Register from './screens/Register';
import BottomNavigator from './BottomNavigator'; // Import the BottomNavigator
import ViewJournal from './screens/ViewJournal';
import Chats from './screens/Chats';
const Stack = createStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true); // Loader state
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Logged-in state

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken'); // Retrieve token
        setIsLoggedIn(!!token); // Check if user is logged in
      } catch (error) {
        console.error('Error checking token:', error);
      } finally {
        setIsLoading(false); // Hide loader
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    // Display loader while determining the initial route
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Login'} screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={Login} />
            <Stack.Screen name="Register" component={Register} />
            <Stack.Screen name="Home" component={BottomNavigator} />
            <Stack.Screen name="ViewJournal" component={ViewJournal} />
            <Stack.Screen name="Chats" component={Chats} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
