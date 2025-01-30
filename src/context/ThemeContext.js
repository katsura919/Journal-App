import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Existing themes + new pastel themes
 export const themes = {
  light: {
    background: '#FFFFFF', // White
    text: '#000000', // Black
  },
  dark: {
    background: '#1E1E1E', // Dark gray
    text: '#FFFFFF', // White
  },
  pastelPink: {
    background: '#FFD1DC', // Soft pastel pink
    text: '#8A5A7D', // Muted pinkish-purple
  },
  pastelBlue: {
    background: '#A2DDF0', // Soft pastel blue
    text: '#2E5266', // Muted navy blue
  },
  pastelGreen: {
    background: '#C8E6C9', // Soft pastel green
    text: '#4CAF50', // Muted green
  },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const animatedBackground = useSharedValue(themes.light.background);

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setTheme(savedTheme);
        animatedBackground.value = themes[savedTheme].background;
      }
    };
    loadTheme();
  }, []);

  const switchTheme = async (newTheme) => {
    setTheme(newTheme);
    animatedBackground.value = withTiming(themes[newTheme].background, { duration: 300 });
    await AsyncStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, switchTheme, animatedBackground }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);