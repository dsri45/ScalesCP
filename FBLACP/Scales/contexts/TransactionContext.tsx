import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initDatabase, getUserTransactions, addTransaction, updateTransaction, deleteTransaction, Transaction } from '../services/database';

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  userId: string | null;
  setUserId: (id: string) => void;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface TransactionProviderProps {
  children: ReactNode;
}

export function TransactionProvider({ children }: TransactionProviderProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeDatabase().catch(console.error);
  }, []);

  useEffect(() => {
    if (userId) {
      refreshTransactions();
    }
  }, [userId]);

  const initializeDatabase = async () => {
    try {
      await initDatabase();
      if (userId) {
        await refreshTransactions();
      }
    } catch (error) {
      console.error('Error initializing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTransactions = async () => {
    try {
      if (!userId) return;
      const data = await getUserTransactions(userId);
      setTransactions(data);
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    }
  };

  const handleAddTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      if (!userId) throw new Error('User ID is required');
      await addTransaction({ ...transaction, userId });
      await refreshTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const handleUpdateTransaction = async (transaction: Transaction) => {
    try {
      if (!userId) throw new Error('User ID is required');
      await updateTransaction(transaction);
      await refreshTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await deleteTransaction(id);
      await refreshTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      isLoading,
      userId,
      setUserId,
      addTransaction: handleAddTransaction,
      updateTransaction: handleUpdateTransaction,
      deleteTransaction: handleDeleteTransaction,
      refreshTransactions,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
