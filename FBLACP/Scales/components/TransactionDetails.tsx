import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { Transaction } from '../services/database';

interface TransactionDetailsProps {
  transaction: Transaction;
  onClose: () => void;
}

export default function TransactionDetails({ transaction, onClose }: TransactionDetailsProps) {
  const { theme, isDarkMode } = useTheme();
  const { currency } = useCurrency();
  const { width } = Dimensions.get('window');

  const isIncome = transaction.amount > 0;
  const colorScheme = isIncome ? COLORS.income : COLORS.expense;
  const colors = isDarkMode ? colorScheme.dark : colorScheme.light;

  // Helper function to format amount with negative sign before currency symbol
  const formatAmount = (amount: number) => {
    const sign = isIncome ? '+' : '-';
    return `${sign}${currency.symbol}${Math.abs(amount).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: theme.background }
    ]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
          accessibilityLabel="Close transaction details"
        >
          <Ionicons name="close" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Transaction Details
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatAmount(transaction.amount)}
          </Text>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {transaction.title}
          </Text>
        </View>

        <View style={styles.section}>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Category</Text>
            <Text style={[styles.value, { color: theme.text.primary }]}>
              {transaction.category}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={[styles.label, { color: theme.text.secondary }]}>Date</Text>
            <Text style={[styles.value, { color: theme.text.primary }]}>
              {formatDate(transaction.date)}
            </Text>
          </View>
          {transaction.isRecurring && (
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.text.secondary }]}>Recurring</Text>
              <View style={styles.recurringInfo}>
                <Ionicons name="repeat" size={16} color={theme.primary} />
                <Text style={[styles.value, { color: theme.primary, marginLeft: 4 }]}>
                  {transaction.recurringType ? 
                    transaction.recurringType.charAt(0).toUpperCase() + transaction.recurringType.slice(1) : 
                    'Unknown'
                  }
                </Text>
              </View>
            </View>
          )}
        </View>

        {transaction.receiptImage && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Receipt
            </Text>
            <Image
              source={{ uri: transaction.receiptImage }}
              style={[styles.receiptImage, { width: width - 32 }]}
              resizeMode="contain"
            />
          </View>
        )}

        {transaction.comment && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
              Comment
            </Text>
            <Text style={[styles.commentText, { color: theme.text.secondary }]}>
              {transaction.comment}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const COLORS = {
  income: {
    light: {
      text: '#2ecc71',
      background: '#f0fff4',
      icon: '#2ecc71',
    },
    dark: {
      text: '#2ecc71',
      background: '#1a2a1a',
      icon: '#2ecc71',
    },
  },
  expense: {
    light: {
      text: '#e74c3c',
      background: '#fff5f5',
      icon: '#e74c3c',
    },
    dark: {
      text: '#e74c3c',
      background: '#2a1a1a',
      icon: '#e74c3c',
    },
  },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  recurringInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiptImage: {
    height: 400,
    borderRadius: 8,
    marginTop: 8,
  },
  commentText: {
    fontSize: 16,
    lineHeight: 24,
    marginTop: 8,
  },
}); 