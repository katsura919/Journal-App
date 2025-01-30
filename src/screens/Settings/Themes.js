import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { useTheme, themes } from '../../context/ThemeContext';
import { useNavigation } from '@react-navigation/native';

const Themes = () => {
  const { theme, switchTheme, animatedBackground } = useTheme();
  const navigation = useNavigation();

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: animatedBackground.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backButtonText}>Go Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: themes[theme]?.text || '#000' }]}>Select Theme</Text>
      
      {Object.keys(themes).map((themeName) => (
        <TouchableOpacity
          key={themeName}
          style={[styles.button, theme === themeName && styles.selectedButton]}
          onPress={() => switchTheme(themeName)}
        >
          <Text style={styles.buttonText}>{themeName.charAt(0).toUpperCase() + themeName.slice(1)} Mode</Text>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#ccc',
    width: '80%',
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#888',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Themes;