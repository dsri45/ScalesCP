/**
 * Home Component
 * 
 * This component serves as the main dashboard of the application, featuring:
 * - Current balance display
 * - Savings goal progress with visual indicator
 * - Income and expense statistics
 * - Recent transactions list
 * - Fish animation based on savings progress
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, COLORS } from '../../contexts/ThemeContext';
import { useTransactions } from '../../contexts/TransactionContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useGoal } from '../../contexts/GoalContext';
import Chart from '../../components/Chart';
import TransactionItem from '../../components/TransactionItem';
import { useRouter } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';
import { getUserById } from '../../services/database'; // Import the function to fetch user by ID

/**
 * Fish animation states
 * Represents different states of the fish based on savings progress:
 * - LIVING: Normal state (50-150% of goal)
 * - DYING: Transition to dead state
 * - DEAD: Below 50% of goal
 * - THRIVING: Above 150% of goal
 * - IMPROVING: Transition from dead to living
 * - BECOMING_THRIVING: Transition to thriving state
 */
enum FishState {
  LIVING = 'living',
  DYING = 'dying',
  DEAD = 'dead',
  THRIVING = 'thriving',
  IMPROVING = 'improving',
  BECOMING_THRIVING = 'becoming_thriving'
}

/**
 * Animation source mapping
 * Maps each fish state to its corresponding GIF animation
 */
const FISH_ANIMATIONS = {
  living: require('../../assets/Living_Fish.gif'),
  dead: require('../../assets/Dead_Fish.gif'),
  dying: require('../../assets/Living_To_Dead.gif'),
  improving: require('../../assets/Living_Fish.gif'),
  becoming_thriving: require('../../assets/Living_To_Thriving.gif'),
  thriving: require('../../assets/Thriving_Fish.gif')
};

export default function Home() {
  // Context hooks for theme, transactions, currency, and goals
  const { theme } = useTheme();
  const { setUserId, transactions } = useTransactions();
  const { currency } = useCurrency();
  const { goalAmount: savedGoalAmount } = useGoal();
  const router = useRouter();
  const { userId } = useLocalSearchParams(); // Retrieve the userId from the query parameters

  // State management
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [fishState, setFishState] = useState<FishState>(FishState.LIVING);
  const [currentAnimation, setCurrentAnimation] = useState<string>('living');
  const [isInitialized, setIsInitialized] = useState(false);
  const [animationKey, setAnimationKey] = useState(Date.now()); // For forcing GIF refresh on Android
  
  // Remove the complex state tracking and use simpler approach
  const [hasShownThrivingTransition, setHasShownThrivingTransition] = useState(false);
  const thriveTransitionRef = useRef<NodeJS.Timeout | null>(null);
  const dieTransitionRef = useRef<NodeJS.Timeout | null>(null);

  // Add a state to track the previous progress value for detecting changes
  const [previousProgress, setPreviousProgress] = useState(0);

  /**
   * Fetch user email when component mounts
   */
  useEffect(() => {
    const fetchUserEmail = async () => {
      if (userId) {
        try {
          const user = await getUserById(userId as string); // Fetch user by ID
          if (user) {
            setUserEmail(user.email); // Set the user's email
          } else {
            console.error('User not found');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    };

    fetchUserEmail();
  }, [userId]);

  /**
   * Set user ID in transaction context
   */
  useEffect(() => {
    if (userId) {
      setUserId(userId as string);
    }
  }, [userId]);

  /**
   * Calculate transaction totals
   * - income: Sum of positive transactions
   * - expenses: Sum of negative transactions (absolute value)
   * - balance: Income minus expenses
   */
  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.amount > 0) {
        acc.income += transaction.amount;
      } else {
        acc.expenses += Math.abs(transaction.amount);
      }
      acc.balance = acc.income - acc.expenses;
      return acc;
    },
    { balance: 0, income: 0, expenses: 0 }
  );

  /**
   * Calculate savings progress
   * - actualProgress: Raw percentage of goal achieved
   * - savingsProgress: Minimum 0% progress
   * - displayProgress: Capped at 100% for progress bar
   */
  const goalAmount = savedGoalAmount ? parseFloat(savedGoalAmount) : 0;
  const actualProgress = goalAmount > 0 ? (totals.balance / goalAmount) * 100 : 0;
  const savingsProgress = Math.max(0, actualProgress);
  const displayProgress = Math.min(100, savingsProgress); // For progress bar

  /**
   * Clean up timers on component unmount
   */
  useEffect(() => {
    return () => {
      if (thriveTransitionRef.current) {
        clearTimeout(thriveTransitionRef.current);
      }
      if (dieTransitionRef.current) {
        clearTimeout(dieTransitionRef.current);
      }
    };
  }, []);

  /**
   * Force GIF animation refresh by updating key
   */
  const refreshAnimation = () => {
    setAnimationKey(Date.now());
  };

  /**
   * Update animation when state changes
   */
  useEffect(() => {
    refreshAnimation();
  }, [currentAnimation]);

  /**
   * Manage fish state based on savings progress
   * Handles transitions between different states:
   * - Dead (below 50%)
   * - Living (50-150%)
   * - Thriving (above 150%)
   * Includes transition animations and timing
   */
  useEffect(() => {
    console.log(`Current state: ${fishState}, Progress: ${actualProgress}%, Previous: ${previousProgress}%`);
    
    setPreviousProgress(actualProgress);
    
    // Initialize state on first load
    if (!isInitialized && goalAmount > 0) {
      if (actualProgress < 50) {
        setFishState(FishState.DEAD);
        setCurrentAnimation('dead');
      } else if (actualProgress >= 150) {
        setFishState(FishState.THRIVING);
        setCurrentAnimation('thriving');
        setHasShownThrivingTransition(true);
      } else {
        setFishState(FishState.LIVING);
        setCurrentAnimation('living');
      }
      setIsInitialized(true);
      return;
    }

    if (goalAmount <= 0) {
      setFishState(FishState.LIVING);
      setCurrentAnimation('living');
      return;
    }

    // Check if progress increased and fish was dead
    const progressIncreased = actualProgress > previousProgress;
    
    // Handle transitions based on progress changes
    if (progressIncreased && fishState === FishState.DEAD) {
      if (actualProgress >= 150) {
        setFishState(FishState.BECOMING_THRIVING);
        setCurrentAnimation('becoming_thriving');
        
        thriveTransitionRef.current = setTimeout(() => {
          setFishState(FishState.THRIVING);
          setCurrentAnimation('thriving');
          setHasShownThrivingTransition(true);
        }, 3000);
        return;
      }
      
      if (actualProgress >= 50) {
        setFishState(FishState.IMPROVING);
        setCurrentAnimation('improving');
        
        setTimeout(() => {
          setFishState(FishState.LIVING);
          setCurrentAnimation('living');
        }, 1000);
        return;
      }
    }

    // Handle transitions to dead state
    if (actualProgress < 50 && fishState !== FishState.DEAD && fishState !== FishState.DYING) {
      if (thriveTransitionRef.current) {
        clearTimeout(thriveTransitionRef.current);
        thriveTransitionRef.current = null;
      }
      
      setFishState(FishState.DYING);
      setCurrentAnimation('dying');
      
      dieTransitionRef.current = setTimeout(() => {
        setFishState(FishState.DEAD);
        setCurrentAnimation('dead');
      }, 3000);
      
      return;
    }

    // Handle transitions to thriving state
    if (actualProgress >= 150 && 
        (fishState !== FishState.THRIVING && fishState !== FishState.BECOMING_THRIVING)) {
      if (dieTransitionRef.current) {
        clearTimeout(dieTransitionRef.current);
        dieTransitionRef.current = null;
      }
      
      setFishState(FishState.BECOMING_THRIVING);
      setCurrentAnimation('becoming_thriving');
      
      thriveTransitionRef.current = setTimeout(() => {
        setFishState(FishState.THRIVING);
        setCurrentAnimation('thriving');
        setHasShownThrivingTransition(true);
      }, 3000);
      
      return;
    }

    // Handle living state
    if (actualProgress >= 50 && actualProgress < 150 && 
        (fishState !== FishState.LIVING && fishState !== FishState.IMPROVING)) {
      if (hasShownThrivingTransition) {
        setHasShownThrivingTransition(false);
      }
      
      if (fishState === FishState.DEAD) {
        setFishState(FishState.IMPROVING);
        setCurrentAnimation('improving');
        
        setTimeout(() => {
          setFishState(FishState.LIVING);
          setCurrentAnimation('living');
        }, 1000);
      } else {
        setFishState(FishState.LIVING);
        setCurrentAnimation('living');
      }
    }
  }, [actualProgress, goalAmount, fishState, isInitialized, hasShownThrivingTransition, previousProgress]);

  /**
   * Get status message based on fish state
   * @returns Appropriate message for current fish state
   */
  const getFishStatusMessage = () => {
    if (goalAmount <= 0) return "Set a savings goal to track your progress!";
    
    if (currentAnimation === 'becoming_thriving') {
      return "Wow! Your fish is evolving as your savings excel!";
    }
    
    switch (fishState) {
      case FishState.DEAD:
        return "Your savings are dangerously low! Add more to revive your fish.";
      case FishState.DYING:
        return "Your fish is dying! Savings have fallen below 50% of your goal.";
      case FishState.LIVING:
        return "Your fish is healthy! Keep up the good work.";
      case FishState.THRIVING:
        return "Amazing! Your savings exceed 150% of your goal. Your fish is thriving!";
      case FishState.IMPROVING:
        return "Great job! Your fish is getting healthier as you save more.";
      default:
        return "Keep saving to maintain a healthy fish!";
    }
  };

  /**
   * Get recent transactions sorted by date
   */
  const recentTransactions = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  /**
   * Navigate to transaction form
   */
  const handleAddTransaction = () => {
    router.push('/transactionForm');
  };

  /**
   * Render fish animation with platform-specific handling
   */
  const renderFishAnimation = () => {
    const animationSource = FISH_ANIMATIONS[currentAnimation as keyof typeof FISH_ANIMATIONS] || FISH_ANIMATIONS.living;
    
    return (
      <Image 
        key={`fish-${animationKey}`}
        source={animationSource}
        style={styles.fishGif}
        resizeMode="contain"
      />
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]} 
      contentInsetAdjustmentBehavior="automatic"
    >
      {/* Header Section with Fish GIF */}
      <View style={[styles.header, { 
        backgroundColor: theme.primary,
        paddingTop: 0,
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'android' ? 30 : 25
      }]}>
        {/* Fish GIF */}
        <View style={[styles.fishContainer, { 
          marginTop: Platform.OS === 'ios' ? -20 : -10,
          paddingTop: 0
        }]}>
          {renderFishAnimation()}
        </View>
        
        <View style={styles.balanceContainer}>
          <Text style={[styles.balanceLabel, { color: 'rgba(255,255,255,0.9)' }]}>Current Balance</Text>
          <Text style={[styles.balanceAmount, { color: '#fff' }]}>
            {currency.symbol}{totals.balance.toFixed(2)}
          </Text>
        </View>
        
        {goalAmount > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressLabelContainer}>
              <Text style={[styles.progressLabel, { color: '#fff' }]}>
                Savings Goal: {currency.symbol}{goalAmount.toFixed(0)}
              </Text>
              <Text style={[
                styles.progressPercentage, 
                { 
                  color: actualProgress < 50 ? theme.expense : 
                         actualProgress >= 150 ? theme.income : '#fff'
                }
              ]}>
                {savingsProgress.toFixed(0)}%
              </Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${displayProgress}%`, 
                    backgroundColor: actualProgress < 50 ? theme.expense : 
                                     actualProgress >= 150 ? theme.income : '#fff'
                  }
                ]} 
              />
            </View>
          </View>
        )}
      </View>

      {/* Stats Cards - add padding above */}
      <View style={{ height: Platform.OS === 'android' ? 20 : 15 }} />
      <View style={[
        styles.statsRow, 
        // Fix Android elevation issue
        Platform.OS === 'android' ? { marginTop: -15 } : { marginTop: -25 }
      ]}>
        <View style={[styles.statCard, { 
          backgroundColor: theme.surface, 
          shadowColor: theme.shadow || '#000000',
          ...(Platform.OS === 'android' && { elevation: 4 })
        }]}>
          <Ionicons name="arrow-up-circle" size={28} color={theme.income} />
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Income</Text>
          <Text style={[styles.statAmount, { color: theme.text.primary }]}>
            {currency.symbol}{totals.income.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.statCard, { 
          backgroundColor: theme.surface, 
          shadowColor: theme.shadow || '#000000',
          ...(Platform.OS === 'android' && { elevation: 4 })
        }]}>
          <Ionicons name="arrow-down-circle" size={28} color={theme.expense} />
          <Text style={[styles.statLabel, { color: theme.text.secondary }]}>Expenses</Text>
          <Text style={[styles.statAmount, { color: theme.text.primary }]}>
            {currency.symbol}{totals.expenses.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Chart Section */}
      <Chart /> 

      {/* Add Transaction Button */}
      <TouchableOpacity 
        style={[styles.addButton, { 
          backgroundColor: theme.primary,
          ...(Platform.OS === 'android' && { elevation: 4 })
        }]}
        onPress={handleAddTransaction}
        activeOpacity={0.8}
      >
        <View style={styles.addButtonContent}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add Transaction</Text>
        </View>
      </TouchableOpacity>

      {/* Recent Transactions */}
      <View style={[styles.recentTransactions, { 
        backgroundColor: theme.surface,
        ...(Platform.OS === 'android' && { elevation: 2 }) 
      }]}>
        <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Recent Transactions</Text>
        {recentTransactions.map((transaction) => (
          <TransactionItem
            key={transaction.id}
            {...transaction}
            receiptImage={transaction.receiptImage ?? undefined}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  fishContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  fishGif: {
    width: 360,
    height: 240,
  },
  balanceContainer: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '100%',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '400',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: -25,
    paddingHorizontal: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    marginTop: 8,
  },
  statAmount: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
  },
  addButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  recentTransactions: {
    padding: 16,
    marginTop: 8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  warningIcon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 150,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});