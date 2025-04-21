/**
 * ThemeContext
 * 
 * This context manages the application's theme state and provides:
 * - Light and dark theme support
 * - Theme persistence
 * - Theme switching functionality
 * - Consistent color palette across the app
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

/**
 * Color palette for text elements
 */
interface TextColors {
  primary: string;
  secondary: string;
}

/**
 * Complete theme interface defining all theme properties
 */
export interface Theme {
  background: string;
  surface: string;
  primary: string;
  income: string;
  expense: string;
  border: string;
  shadow?: string;
  text: TextColors;
}

/**
 * Available theme modes
 */
type ThemeMode = 'light' | 'dark';

/**
 * ThemeContext value interface
 */
interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  toggleTheme: () => void;
}

/**
 * Create ThemeContext with default light theme
 */
const ThemeContext = createContext<ThemeContextType>({
  theme: {
    background: '#FFFFFF',
    surface: '#F5F5F5',
    primary: '#007AFF',
    income: '#34C759',
    expense: '#FF3B30',
    border: '#E5E5EA',
    text: {
      primary: '#000000',
      secondary: '#666666',
    },
  },
  themeMode: 'light',
  toggleTheme: () => {},
});

/**
 * Light theme configuration
 */
const lightTheme: Theme = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  primary: '#007AFF',
  income: '#34C759',
  expense: '#FF3B30',
  border: '#E5E5EA',
  shadow: '#000000',
  text: {
    primary: '#000000',
    secondary: '#666666',
  },
};

/**
 * Dark theme configuration
 */
const darkTheme: Theme = {
  background: '#000000',
  surface: '#1C1C1E',
  primary: '#0A84FF',
  income: '#32D74B',
  expense: '#FF453A',
  border: '#38383A',
  shadow: '#000000',
  text: {
    primary: '#FFFFFF',
    secondary: '#98989F',
  },
};

/**
 * ThemeProvider Component
 * 
 * Manages theme state and provides theme context to the application.
 * Handles theme persistence and system theme detection.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Get system color scheme
  const systemColorScheme = useColorScheme();
  
  // State for theme mode and current theme
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    (systemColorScheme as ThemeMode) || 'light'
  );
  const [theme, setTheme] = useState<Theme>(
    themeMode === 'light' ? lightTheme : darkTheme
  );

  /**
   * Load saved theme preference from AsyncStorage
   */
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themeMode');
        if (savedTheme) {
          setThemeMode(savedTheme as ThemeMode);
          setTheme(savedTheme === 'light' ? lightTheme : darkTheme);
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      }
    };

    loadTheme();
  }, []);

  /**
   * Toggle between light and dark themes
   * Updates both state and persisted preference
   */
  const toggleTheme = async () => {
    const newThemeMode: ThemeMode = themeMode === 'light' ? 'dark' : 'light';
    try {
      await AsyncStorage.setItem('themeMode', newThemeMode);
      setThemeMode(newThemeMode);
      setTheme(newThemeMode === 'light' ? lightTheme : darkTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * Custom hook to access the ThemeContext
 * @returns The ThemeContext value
 */
export function useTheme() {
  return useContext(ThemeContext);
}

/**
 * Export theme colors for direct use in components
 */
export const COLORS = {
  ...lightTheme,
  ...darkTheme,
}; 