/**
 * GoalContext
 * 
 * This context manages the user's savings goal state throughout the application.
 * It provides functionality to:
 * - Set and update the savings goal amount
 * - Track goal progress
 * - Persist goal data
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Interface for the GoalContext value
 */
interface GoalContextType {
  goalAmount: string | null;
  setGoalAmount: (amount: string) => void;
}

/**
 * Create the GoalContext with default values
 */
const GoalContext = createContext<GoalContextType>({
  goalAmount: null,
  setGoalAmount: () => {},
});

/**
 * GoalProvider Component
 * 
 * Wraps the application to provide goal-related functionality to all child components.
 * Manages goal state and persistence using AsyncStorage.
 */
export function GoalProvider({ children }: { children: React.ReactNode }) {
  // State for the goal amount
  const [goalAmount, setGoalAmountState] = useState<string | null>(null);

  /**
   * Load saved goal amount from AsyncStorage when component mounts
   */
  useEffect(() => {
    const loadGoalAmount = async () => {
      try {
        const savedAmount = await AsyncStorage.getItem('goalAmount');
        if (savedAmount) {
          setGoalAmountState(savedAmount);
        }
      } catch (error) {
        console.error('Error loading goal amount:', error);
      }
    };

    loadGoalAmount();
  }, []);

  /**
   * Update goal amount in state and AsyncStorage
   * @param amount - The new goal amount to set
   */
  const setGoalAmount = async (amount: string) => {
    try {
      await AsyncStorage.setItem('goalAmount', amount);
      setGoalAmountState(amount);
    } catch (error) {
      console.error('Error saving goal amount:', error);
    }
  };

  return (
    <GoalContext.Provider value={{ goalAmount, setGoalAmount }}>
      {children}
    </GoalContext.Provider>
  );
}

/**
 * Custom hook to access the GoalContext
 * @returns The GoalContext value
 */
export function useGoal() {
  return useContext(GoalContext);
}