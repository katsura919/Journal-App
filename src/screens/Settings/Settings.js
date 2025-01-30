import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons'; // For icons
import { useTheme, themes } from '../../context/ThemeContext'; // Import the Theme context

const Settings = ({ navigation }) => {
  const { theme } = useTheme(); // Access current theme and themes from context

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
    <View style={[styles.container, { backgroundColor: themes[theme]?.background || '#fff' }]}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={themes[theme]?.text || '#000'} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: themes[theme]?.text || '#000' }]}>Settings</Text>
      </View>

      {/* Settings Options */}
      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Themes')}>
        <MaterialIcons name="color-lens" size={24} color={themes[theme]?.text || '#000'} />
        <Text style={[styles.optionText, { color: themes[theme]?.text || '#000' }]}>Theme</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={() => navigation.navigate('Privacy')}>
        <MaterialIcons name="privacy-tip" size={24} color={themes[theme]?.text || '#000'} />
        <Text style={[styles.optionText, { color: themes[theme]?.text || '#000' }]}>Privacy</Text>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  optionText: {
    fontSize: 18,
    marginLeft: 10,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Settings;
