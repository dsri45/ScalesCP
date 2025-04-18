import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type GoalContextType = {
  showGoalModal: boolean;
  setShowGoalModal: (show: boolean) => void;
  goalAmount: string;
  setGoalAmount: (amount: string) => void;
  currentGoal: string | null;
  saveGoal: (amount: string) => Promise<void>;
  loadGoal: () => Promise<void>;
};

const GoalContext = createContext<GoalContextType | undefined>(undefined);

export function GoalProvider({ children }: { children: React.ReactNode }) {
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalAmount, setGoalAmount] = useState('');
  const [currentGoal, setCurrentGoal] = useState<string | null>(null);

  const loadGoal = async () => {
    try {
      const savedGoal = await AsyncStorage.getItem('savings_goal');
      if (savedGoal) {
        setCurrentGoal(savedGoal);
      }
    } catch (error) {
      console.error('Error loading goal:', error);
    }
  };

  const saveGoal = async (amount: string) => {
    try {
      await AsyncStorage.setItem('savings_goal', amount);
      setCurrentGoal(amount);
      setShowGoalModal(false);
      setGoalAmount('');
    } catch (error) {
      console.error('Error saving goal:', error);
      throw error;
    }
  };

  useEffect(() => {
    loadGoal();
  }, []);

  return (
    <GoalContext.Provider 
      value={{ 
        showGoalModal, 
        setShowGoalModal, 
        goalAmount, 
        setGoalAmount, 
        currentGoal,
        saveGoal,
        loadGoal
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export const useGoal = () => {
  const context = useContext(GoalContext);
  if (context === undefined) {
    throw new Error('useGoal must be used within a GoalProvider');
  }
  return context;
};