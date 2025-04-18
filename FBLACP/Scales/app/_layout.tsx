import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TransactionProvider } from '../contexts/TransactionContext';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import { GoalProvider } from '../contexts/GoalContext';
import { StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';

interface GoalModalProps {
  visible: boolean;
}

export function GoalModal({ visible }: GoalModalProps) {
  if (!visible) return null; // Render nothing if not visible

  // Component implementation
}

// Create a separate component for Stack configuration
function StackNavigator() {
  const { theme } = useTheme();
  
  return (
    <Stack initialRouteName="login"> {/* Set the initial route to "login" */}
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: false // Hide the header for the login screen
        }} 
      />
      <Stack.Screen 
        name="signup" 
        options={{ 
          headerShown: false // Hide the header for the signup screen
        }} 
      />
      <Stack.Screen 
        name="(tabs)" 
        options={{ 
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="transactionForm" 
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Add Transaction',
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text.primary,
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="scanReceipt" 
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Scan Receipt',
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text.primary,
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="currencySelect" 
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Select Currency',
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text.primary,
          headerShadowVisible: false,
        }} 
      />
      <Stack.Screen 
        name="policyModal" 
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'Privacy Policy',
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text.primary,
          headerShadowVisible: false,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [showGoalModal, setShowGoalModal] = useState(false);

  const handleLogin = async () => {
    try {
      // ... existing login logic ...
      const hasGoal = await AsyncStorage.getItem('savings_goal');
      if (!hasGoal) {
        setShowGoalModal(true);
      }
      // ... continue with navigation ...
    } catch (error) {
      // ... error handling ...
    }
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <TransactionProvider>
          <CurrencyProvider>
            <GoalProvider>
              <StackNavigator />
              <GoalModal visible={showGoalModal} />
            </GoalProvider>
          </CurrencyProvider>
        </TransactionProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});