import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type GoalContextType = {
  goalAmount: string;
  setGoalAmount: (amount: string) => void;
  saveGoal: (amount: string) => Promise<void>;
  showGoalModal: boolean;
  setShowGoalModal: (show: boolean) => void;
};

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [goalAmount, setGoalAmount] = useState('');
  const [showGoalModal, setShowGoalModal] = useState(false);

  const saveGoal = async (amount: string) => {
    try {
      console.log(`Saving goal amount: ${amount}`);
      await AsyncStorage.setItem('savings_goal', amount);
      setGoalAmount(amount);
      console.log(`Goal amount updated in context: ${amount}`);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  useEffect(() => {
    // Load saved goal on mount
    const loadGoal = async () => {
      try {
        const savedGoal = await AsyncStorage.getItem('savings_goal');
        if (savedGoal) {
          setGoalAmount(savedGoal);
        }
      } catch (error) {
        console.error('Error loading goal:', error);
      }
    };
    loadGoal();
  }, []);

  return (
    <GoalContext.Provider value={{ 
      goalAmount, 
      setGoalAmount, 
      saveGoal,
      showGoalModal,
      setShowGoalModal
    }}>
      {children}
    </GoalContext.Provider>
  );
}

export const useGoal = () => {
  const context = useContext(GoalContext);
  if (!context) {
    throw new Error('useGoal must be used within a GoalProvider');
  }
  return context;
};