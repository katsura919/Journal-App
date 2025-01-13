import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Home from './screens/Home';
import CreateJournal from './screens/CreateJournal'; 
import JournalList from './screens/JournalLists';
import Profile from './screens/Profile'; // Assuming you have a Profile screen
import Settings from './screens/Settings'; // Assuming you have a Settings screen

const Tab = createBottomTabNavigator();

const BottomNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'settings' : 'settings-outline';
          }else if (route.name === 'Lists') {
            iconName = focused ? 'settings' : 'settings-outline';
          }else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'tomato',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTab" component={Home} />
      <Tab.Screen name="Create" component={CreateJournal} />
      <Tab.Screen name="Lists" component={JournalList} />
      <Tab.Screen name="Profile" component={Profile} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  );
};

export default BottomNavigator;
