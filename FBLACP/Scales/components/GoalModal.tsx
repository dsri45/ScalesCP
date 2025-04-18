import React from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { useGoal } from '../contexts/GoalContext';
import { useCurrency } from '../contexts/CurrencyContext';

export function GoalModal() {
  const { theme } = useTheme();
  const { currency } = useCurrency();
  const { 
    showGoalModal, 
    goalAmount, 
    setGoalAmount,
    saveGoal 
  } = useGoal();

  const handleSave = async () => {
    if (!goalAmount || isNaN(Number(goalAmount))) {
      Alert.alert('Invalid Amount', 'Please enter a valid number');
      return;
    }
    try {
      await saveGoal(goalAmount);
    } catch (error) {
      Alert.alert('Error', 'Failed to save goal');
    }
  };

  return (
    <Modal
      visible={showGoalModal}
      transparent
      animationType="fade"
      onRequestClose={() => null}
    >
      <View style={[styles.modalOverlay]}>
        <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
          <Text style={[styles.modalTitle, { color: theme.text.primary }]}>Set Savings Goal</Text>
          <Text style={[styles.modalSubtitle, { color: theme.text.secondary }]}>
            Please set your savings goal to continue
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.background,
              color: theme.text.primary,
              borderColor: theme.border
            }]}
            placeholder={`Enter amount (${currency.symbol})`}
            placeholderTextColor={theme.text.secondary}
            keyboardType="numeric"
            value={goalAmount}
            onChangeText={setGoalAmount}
          />
          <Pressable
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save Goal</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '80%',
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});