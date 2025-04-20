import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function InstructionsScreen() {
  const { theme } = useTheme();

  return (
    <>
      <Stack.Screen options={{ 
        title: 'How to Use Scales',
        headerStyle: { backgroundColor: theme.primary },
        headerTintColor: '#fff',
      }} />
      
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={[styles.card, { backgroundColor: theme.surface }]}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="home" size={24} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Home Screen</Text>
            </View>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              The home screen displays your current balance, savings progress, and recent transactions.
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Watch your fish thrive or struggle based on your savings progress
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Track your income and expenses at a glance
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Add new transactions directly from this screen
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="wallet" size={24} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Savings Fish</Text>
            </View>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              The fish animation shows your savings health:
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Below 50% of goal: Fish struggles and eventually dies
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • 50-100% of goal: Fish is living normally
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Above 150% of goal: Fish thrives with special animation
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="add-circle" size={24} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Adding Transactions</Text>
            </View>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              Tap "Add Transaction" to record your income or expenses:
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Choose between Income or Expense
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Select a category for tracking purposes
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Add optional receipt images for reference
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Set recurring transactions for regular payments
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="stats-chart" size={24} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Tracking Progress</Text>
            </View>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              Use the Stats tab to analyze your spending habits:
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • View monthly breakdowns of income and expenses
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Analyze spending by category
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Track progress toward your savings goal
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="settings" size={24} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Customizing Settings</Text>
            </View>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              Personalize your experience in the Settings tab:
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Switch between light and dark mode
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Change your preferred currency
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Set or update your savings goal
            </Text>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="help-buoy" size={24} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>Tips for Success</Text>
            </View>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Set a realistic savings goal to keep your fish healthy
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Record transactions regularly to maintain accurate data
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Review your spending patterns weekly to identify savings opportunities
            </Text>
            <Text style={[styles.paragraph, { color: theme.text.secondary }]}>
              • Use categories consistently for better tracking
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
}); 