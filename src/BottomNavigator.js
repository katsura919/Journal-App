import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Home from './screens/Home/Home';
import CreateJournal from './screens/Journal/CreateJournal'; 
import JournalList from './screens/Journal/JournalLists';
import Insights from './screens/Insights/Insights'; 
import Profile from './screens/Profile/Profile'; 

const Tab = createBottomTabNavigator();

const BottomNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Create') {
            iconName = focused ? 'create' : 'create-outline';
          } else if (route.name === 'Lists') {
            iconName = focused ? 'journal' : 'journal-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#60ae73',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          backgroundColor: '#404140', // Background color
          borderTopColor: 'transparent', // Remove top border
          height: 60, // Height of the tab bar
          paddingTop: '5',
          borderTopWidth: 0,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Create" component={CreateJournal} />
      <Tab.Screen name="Lists" component={JournalList} />
      <Tab.Screen name="Insights" component={Insights} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
};

export default BottomNavigator;
