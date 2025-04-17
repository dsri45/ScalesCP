import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initDatabase, getTransactions, addTransaction as dbAddTransaction, updateTransaction as dbUpdateTransaction, deleteTransaction as dbDeleteTransaction, Transaction } from '../services/database';
import { useAuth } from './AuthContext';

type TransactionFormData = {
  amount: number;
  type: string;
  category: string;
  description: string;
  date: string;
};

interface TransactionContextType {
  transactions: Transaction[];
  isLoading: boolean;
  addTransaction: (transaction: TransactionFormData) => Promise<void>;
  updateTransaction: (transaction: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      initializeDatabase().catch(console.error);
    }
  }, [user]);

  const initializeDatabase = async () => {
    try {
      await initDatabase();
      await refreshTransactions();
    } catch (error) {
      console.error('Error initializing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTransactions = async () => {
    if (!user) return;
    try {
      const data = await getTransactions(user.id);
      setTransactions(data);
    } catch (error) {
      console.error('Error refreshing transactions:', error);
    }
  };

  const handleAddTransaction = async (transaction: TransactionFormData) => {
    if (!user) return;
    try {
      const newTransaction = {
        ...transaction,
        userId: user.id,
      };
      await dbAddTransaction(newTransaction);
      await refreshTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const handleUpdateTransaction = async (transaction: Transaction) => {
    if (!user) return;
    try {
      await dbUpdateTransaction(transaction);
      await refreshTransactions();
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await dbDeleteTransaction(id);
      await refreshTransactions();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        isLoading,
        addTransaction: handleAddTransaction,
        updateTransaction: handleUpdateTransaction,
        deleteTransaction: handleDeleteTransaction,
        refreshTransactions,
      }}
    >
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

export type { TransactionFormData };
