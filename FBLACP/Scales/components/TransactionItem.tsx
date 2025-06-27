import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Pressable, GestureResponderEvent, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, COLORS } from '../contexts/ThemeContext';
import { useCurrency } from '../contexts/CurrencyContext';
import TransactionDetails from './TransactionDetails';
import { Transaction } from '../services/database';

interface TransactionItemProps {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: string | null;
  isSwipeActive?: boolean;
  onPress?: () => void;
  receiptImage?: string;
}

export default function TransactionItem({
  id,
  title,
  amount,
  date,
  category,
  isRecurring,
  recurringType,
  recurringEndDate,
  onPress,
  receiptImage,
}: TransactionItemProps) {
  const { theme, isDarkMode } = useTheme();
  const { currency } = useCurrency();
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const [showDetails, setShowDetails] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const SWIPE_THRESHOLD = 5;

  const handleTouchStart = (event: GestureResponderEvent) => {
    touchStartX.current = event.nativeEvent.pageX;
  };

  const handleTouchEnd = (event: GestureResponderEvent) => {
    touchEndX.current = event.nativeEvent.pageX;
    const swipeDistance = Math.abs(touchEndX.current - touchStartX.current);
    
    if (swipeDistance < SWIPE_THRESHOLD) {
      if (onPress) {
        onPress();
      } else {
        setShowDetails(true);
      }
    }
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  const isIncome = amount > 0;
  
  // Helper function to format amount with negative sign before currency symbol
  const formatAmount = (amount: number) => {
    const sign = isIncome ? '+' : '-';
    return `${sign}${currency.symbol}${Math.abs(amount).toFixed(2)}`;
  };

  // Get appropriate background color based on transaction type and theme
  const getBgColor = () => {
    if (isIncome) {
      return isDarkMode ? 'rgba(102, 187, 106, 0.15)' : 'rgba(102, 187, 106, 0.1)';
    } else {
      return isDarkMode ? 'rgba(239, 83, 80, 0.15)' : 'rgba(239, 83, 80, 0.1)';
    }
  };

  const transaction: Transaction = {
    id,
    title,
    amount,
    date,
    category,
    isRecurring,
    recurringType,
    recurringEndDate,
    receiptImage,
    userId: 'default-user',
  };

  return (
    <>
      <Pressable
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={({ pressed }) => [
          styles.container,
          {
            backgroundColor: getBgColor(),
            borderLeftWidth: 4,
            borderLeftColor: isIncome ? theme.income : theme.expense,
            opacity: pressed ? 0.9 : 1,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            shadowColor: theme.shadowColor,
          }
        ]}
        accessibilityRole="button"
        accessibilityLabel={`Transaction: ${title}, Amount: ${amount > 0 ? 'Income' : 'Expense'} ${currency.symbol}${Math.abs(amount)}, Category: ${category}, Date: ${date}`}
      >
        <View style={styles.leftContent}>
          <View style={[
            styles.iconContainer,
            {
              backgroundColor: isDarkMode ? theme.background : '#fff',
              shadowColor: theme.shadowColor,
            }
          ]}>
            <Ionicons 
              name={isIncome ? "arrow-up" : "arrow-down"} 
              size={20} 
              color={isIncome ? theme.income : theme.expense}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[
              styles.title,
              { color: theme.text.primary }
            ]}>
              {title}
            </Text>
            <View style={styles.detailsContainer}>
              <Text style={[styles.category, { color: theme.text.secondary }]}>
                {category}
              </Text>
              {isRecurring && (
                <View style={[styles.recurringBadge, { backgroundColor: theme.secondary + '20' }]}>
                  <Ionicons 
                    name="repeat" 
                    size={12} 
                    color={theme.secondary}
                    style={styles.recurringIcon}
                  />
                  <Text style={[styles.recurringText, { color: theme.secondary }]}>
                    {recurringType?.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.rightContent}>
          <Text style={[
            styles.amount,
            { color: isIncome ? theme.income : theme.expense }
          ]}>
            {formatAmount(amount)}
          </Text>
          <Text style={[
            styles.date,
            { color: theme.text.secondary }
          ]}>
            {new Date(date).toLocaleDateString()}
          </Text>
        </View>
      </Pressable>

      <Modal
        visible={showDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseDetails}
      >
        <TransactionDetails
          transaction={transaction}
          onClose={handleCloseDetails}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    opacity: 0.8,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  recurringIndicator: {
  flexDirection: 'row',
  alignItems: 'center',
  marginLeft: 8,
  backgroundColor: 'rgba(0,0,0,0.05)',
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
},
recurringEndDate: {
  fontSize: 12,
  marginLeft: 4,
  opacity: 0.8,
},
detailsContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},
recurringBadge: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 6,
  paddingVertical: 2,
  borderRadius: 12,
  gap: 2,
},
recurringIcon: {
  marginRight: 2,
},
recurringText: {
  fontSize: 10,
  fontWeight: '600',
},
});