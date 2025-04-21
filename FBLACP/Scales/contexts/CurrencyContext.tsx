/**
 * CurrencyContext
 * 
 * This context manages currency-related functionality in the application, including:
 * - Currency selection and formatting
 * - Exchange rate handling
 * - Currency symbol display
 * - Currency persistence
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert, TextInput } from 'react-native';
import CurrencyConversionDialog from '../components/CurrencyConversionDialog';
import { getDatabase } from '../services/database';
import { useTransactions } from './TransactionContext';

/**
 * Interface for currency information
 */
interface Currency {
  code: string;
  symbol: string;
  name: string;
  rate: number;
}

/**
 * CurrencyContext value interface
 */
interface CurrencyContextType {
  currency: Currency;
  setCurrency: (code: string) => void;
  formatAmount: (amount: number) => string;
  convertAmount: (amount: number, fromCurrency: string, toCurrency: string) => number;
}

/**
 * Available currencies with their details
 */
const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1 },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.85 },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.72 },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 110.5 },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', rate: 1.25 },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', rate: 1.30 },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 6.45 },
  INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 75.0 },
};

/**
 * Create CurrencyContext with default values
 */
const CurrencyContext = createContext<CurrencyContextType>({
  currency: CURRENCIES.USD,
  setCurrency: () => {},
  formatAmount: () => '',
  convertAmount: () => 0,
});

/**
 * CurrencyProvider Component
 * 
 * Manages currency state and provides currency-related functionality
 * to the entire application.
 */
export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  // State for current currency
  const [currency, setCurrencyState] = useState<Currency>(CURRENCIES.USD);
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [pendingCurrency, setPendingCurrency] = useState<{ symbol: string; code: string } | null>(null);
  const { transactions } = useTransactions();

  /**
   * Load saved currency preference from AsyncStorage
   */
  useEffect(() => {
    const loadCurrency = async () => {
      try {
        const savedCurrency = await AsyncStorage.getItem('currency');
        if (savedCurrency && CURRENCIES[savedCurrency]) {
          setCurrencyState(CURRENCIES[savedCurrency]);
        }
      } catch (error) {
        console.error('Error loading currency:', error);
      }
    };

    loadCurrency();
  }, []);

  /**
   * Set new currency and save preference
   * @param code - The currency code to set
   */
  const setCurrency = async (code: string) => {
    if (CURRENCIES[code]) {
      try {
        await AsyncStorage.setItem('currency', code);
        setCurrencyState(CURRENCIES[code]);
      } catch (error) {
        console.error('Error saving currency:', error);
      }
    }
  };

  /**
   * Format amount according to current currency
   * @param amount - The amount to format
   * @returns Formatted amount string
   */
  const formatAmount = (amount: number): string => {
    return `${currency.symbol}${Math.abs(amount).toFixed(2)}`;
  };

  /**
   * Convert amount between currencies
   * @param amount - The amount to convert
   * @param fromCurrency - Source currency code
   * @param toCurrency - Target currency code
   * @returns Converted amount
   */
  const convertAmount = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (!CURRENCIES[fromCurrency] || !CURRENCIES[toCurrency]) {
      return amount;
    }
    return (amount * CURRENCIES[toCurrency].rate) / CURRENCIES[fromCurrency].rate;
  };

  const handleConversionConfirm = async (rate: number) => {
    if (!pendingCurrency) return;
    
    try {
      await AsyncStorage.setItem('currency', JSON.stringify(pendingCurrency));
      
      // Update transactions with new currency rate
      const updatedTransactions = transactions.map(transaction => ({
        ...transaction,
        amount: transaction.amount * rate
      }));
      
      setCurrencyState(CURRENCIES[pendingCurrency.code]);
    } catch (error) {
      console.error('Error saving currency:', error);
      Alert.alert('Error', 'Failed to save currency settings');
    } finally {
      setShowConversionDialog(false);
      setPendingCurrency(null);
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        formatAmount,
        convertAmount,
      }}
    >
      {children}
      <CurrencyConversionDialog
        visible={showConversionDialog}
        onClose={() => {
          setShowConversionDialog(false);
          setPendingCurrency(null);
        }}
        onConfirm={handleConversionConfirm}
        fromCurrency={currency.code}
        toCurrency={pendingCurrency?.code || ''}
      />
    </CurrencyContext.Provider>
  );
}

/**
 * Custom hook to access the CurrencyContext
 * @returns The CurrencyContext value
 */
export function useCurrency() {
  return useContext(CurrencyContext);
}

interface Transaction {
  id: number;
  amount: number;
}

async function convertExistingTransactions(newRate: number, oldRate: number) {
  try {
    const db = getDatabase();
    const transactions = await db.getAllAsync('SELECT * FROM transactions') as Transaction[];
    
    for (const transaction of transactions) {
      const newAmount = transaction.amount * newRate;
      
      await db.runAsync(
        'UPDATE transactions SET amount = ? WHERE id = ?',
        [newAmount, transaction.id]
      );
    }
  } catch (error) {
    console.error('Error converting transactions:', error);
    Alert.alert('Error', 'Failed to convert transactions');
    throw error;
  }
}