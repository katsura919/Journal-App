import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

const themes = {
  light: { background: '#FFFFFF', text: '#000000' },
  dark: { background: '#1E1E1E', text: '#FFFFFF' },
  navy: { background: '#0A192F', text: '#64FFDA' },
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
