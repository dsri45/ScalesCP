/**
 * TransactionContext
 * 
 * This context manages all transaction-related state and operations in the application.
 * It provides functionality to:
 * - Add, update, and delete transactions
 * - Filter and sort transactions
 * - Track transaction totals
 * - Persist transaction data
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTransactions, addTransaction, updateTransaction, deleteTransaction } from '../services/database';

/**
 * Interface for a single transaction
 */
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  receiptImage?: string | null;
  comment?: string | null;
  userId: string;
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: string | null;
}

/**
 * Interface for transaction totals
 */
interface TransactionTotals {
  income: number;
  expenses: number;
  balance: number;
}

/**
 * TransactionContext value interface
 */
interface TransactionContextType {
  transactions: Transaction[];
  totals: TransactionTotals;
  userId: string | null;
  setUserId: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  isLoading: boolean;
}

/**
 * Create TransactionContext with default values
 */
const TransactionContext = createContext<TransactionContextType>({
  transactions: [],
  totals: { income: 0, expenses: 0, balance: 0 },
  userId: null,
  setUserId: () => {},
  addTransaction: async () => {},
  updateTransaction: async () => {},
  deleteTransaction: async () => {},
  isLoading: false,
});

/**
 * TransactionProvider Component
 * 
 * Manages transaction state and provides transaction-related functionality
 * to the entire application.
 */
export function TransactionProvider({ children }: { children: React.ReactNode }) {
  // State management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userId, setUserIdState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    { income: 0, expenses: 0, balance: 0 }
  );

  /**
   * Set user ID and update transactions
   * @param id - The user ID to set
   */
  const setUserId = (id: string) => {
    setUserIdState(id);
  };

  /**
   * Load transactions when user ID changes
   */
  useEffect(() => {
    const loadTransactions = async () => {
      if (userId) {
        setIsLoading(true);
        try {
          const userTransactions = await getTransactions();
          setTransactions(userTransactions as Transaction[]);
        } catch (error) {
          console.error('Error loading transactions:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadTransactions();
  }, [userId]);

  /**
   * Add a new transaction
   * @param transaction - The transaction to add (without ID)
   */
  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!userId) return;

    try {
      const newTransaction = await addTransaction(transaction);
      if (typeof newTransaction === 'string') {
        throw new Error('Invalid transaction returned');
      }
      setTransactions(prev => [...prev, newTransaction]);
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  /**
   * Update an existing transaction
   * @param id - The ID of the transaction to update
   * @param updates - The updates to apply
   */
  const handleUpdateTransaction = async (id: string, updates: Partial<Transaction>) => {
    if (!userId) return;

    try {
      const fullTransaction = { ...updates, id } as Transaction;
      await updateTransaction(fullTransaction);
      setTransactions(prev =>
        prev.map(transaction =>
          transaction.id === id ? { ...transaction, ...updates } : transaction
        )
      );
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  /**
   * Delete a transaction
   * @param id - The ID of the transaction to delete
   */
  const handleDeleteTransaction = async (id: string) => {
    if (!userId) return;

    try {
      await deleteTransaction(id);
      setTransactions(prev => prev.filter(transaction => transaction.id !== id));
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        totals,
        userId,
        setUserId,
        addTransaction: handleAddTransaction,
        updateTransaction: handleUpdateTransaction,
        deleteTransaction: handleDeleteTransaction,
        isLoading,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

/**
 * Custom hook to access the TransactionContext
 * @returns The TransactionContext value
 */
export function useTransactions() {
  return useContext(TransactionContext);
}
