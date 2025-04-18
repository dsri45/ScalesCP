import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define custom app colors
export const COLORS = {
  blue: '#1A5D9F',       // Main blue color (less bright)
  orange: '#FF8C42',     // Orange accent color
  green: '#66BB6A',      // Lighter green for income
  red: '#EF5350',        // Lighter red for expenses
  lightBg: '#F5F7FA',    // Light theme background
  darkBg: '#121212',     // Dark theme background
  white: '#FFFFFF',
  black: '#000000',
  lightGray: '#EEEEEE',
  darkGray: '#333333',
};

// Define theme colors and properties
export const lightTheme: Theme = {
  primary: COLORS.blue,
  secondary: COLORS.orange,
  background: COLORS.lightBg,
  surface: COLORS.white,
  border: 'rgba(0,0,0,0.1)',
  shadowColor: COLORS.black,
  text: {
    primary: COLORS.black,
    secondary: '#666666',
  },
  statusBar: 'dark',
  shadow: COLORS.black,
  income: COLORS.green,
  expense: COLORS.red,
};

export const darkTheme: Theme = {
  primary: COLORS.blue,
  secondary: COLORS.orange,
  background: COLORS.darkBg,
  surface: '#1C1C1E',
  border: 'rgba(255,255,255,0.1)',
  shadowColor: COLORS.white,
  text: {
    primary: COLORS.white,
    secondary: '#EBEBF5',
  },
  statusBar: 'light',
  shadow: COLORS.white,
  income: COLORS.green,
  expense: COLORS.red,
};

export type Theme = {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  border: string;
  shadowColor: string;
  text: {
    primary: string;
    secondary: string;
  };
  statusBar: 'light' | 'dark';
  shadow: string;
  income: string;
  expense: string;
};

interface ThemeContextType {
  theme: Theme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDark] = useState(false);

  // Load saved theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  // Load theme from AsyncStorage
  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  // Save theme preference
  const saveThemePreference = async (isDark: boolean) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  // Toggle theme function
  const toggleTheme = useCallback(() => {
    setIsDark(prevIsDark => {
      const newIsDark = !prevIsDark;
      saveThemePreference(newIsDark);
      return newIsDark;
    });
  }, []);

  // Get current theme based on isDark state
  const theme = isDarkMode ? darkTheme : lightTheme;

  const value = {
    theme,
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 