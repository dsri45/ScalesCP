import { Stack } from "expo-router";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '../contexts/ThemeContext';
import { TransactionProvider } from '../contexts/TransactionContext';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import { GoalProvider } from '../contexts/GoalContext';
import { StyleSheet, Modal, View, Text, TextInput, Pressable, TouchableOpacity, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { useGoal } from '../contexts/GoalContext';
import { useCurrency } from '../contexts/CurrencyContext';

interface GoalModalProps {
  visible?: boolean;
}

export function GoalModal({ visible }: GoalModalProps) {
  const { theme } = useTheme();
  const [amount, setAmount] = useState('');
  const { saveGoal, showGoalModal, setShowGoalModal } = useGoal();
  const { currency } = useCurrency();

  const isVisible = visible !== undefined ? visible : showGoalModal;

  const handleSave = async () => {
    if (!amount) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    try {
      await saveGoal(amount);
      setAmount('');
      setShowGoalModal(false);
      Alert.alert('Success', 'Savings goal has been set!');
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal. Please try again.');
    }
  };

  return (
    <Modal 
      visible={isVisible} 
      transparent={true}
      animationType="fade"
    >
      <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Set Savings Goal</Text>
          <TextInput
            style={[styles.input, { 
              borderColor: theme.border, 
              color: theme.text.primary,
              backgroundColor: theme.background
            }]}
            placeholder="Enter your savings goal"
            placeholderTextColor={theme.text.secondary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
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
      <Stack.Screen 
        name="instructions" 
        options={{
          presentation: 'modal',
          headerShown: true,
          headerTitle: 'How to Use Scales',
          headerStyle: {
            backgroundColor: theme.primary,
          },
          headerTintColor: '#fff',
          headerShadowVisible: false,
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <ThemeProvider>
        <TransactionProvider>
          <CurrencyProvider>
            <GoalProvider>
              <StackNavigator />
              <GoalModal />
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  saveButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});