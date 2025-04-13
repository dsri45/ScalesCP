import * as SQLite from 'expo-sqlite';

// Open/create the database
const db = SQLite.openDatabaseSync('Scales.db');

// Types
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  date: string;
  category: string;
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: string | null;
  receiptImage?: string | null;
  comment?: string | null;
}

// Initialize database
export const initDatabase = async () => {
  try {
    // Create table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY NOT NULL,
        title TEXT NOT NULL,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        category TEXT NOT NULL,
        isRecurring INTEGER DEFAULT 0,
        recurringType TEXT,
        recurringEndDate TEXT,
        receiptImage TEXT,
        comment TEXT
      );
    `);

    // Check existing columns
    const tableInfo = await db.getAllAsync("PRAGMA table_info(transactions);");
    const columns = tableInfo.map((col: any) => col.name);
    
    if (!columns.includes('isRecurring')) {
      await db.execAsync(`ALTER TABLE transactions ADD COLUMN isRecurring INTEGER DEFAULT 0;`);
      await db.execAsync(`ALTER TABLE transactions ADD COLUMN recurringType TEXT;`);
      await db.execAsync(`ALTER TABLE transactions ADD COLUMN recurringEndDate TEXT;`);
    }
    
    if (!columns.includes('receiptImage')) {
      await db.execAsync(`ALTER TABLE transactions ADD COLUMN receiptImage TEXT;`);
    }
    
    if (!columns.includes('comment')) {
      await db.execAsync(`ALTER TABLE transactions ADD COLUMN comment TEXT;`);
    }

    console.log('Database initialized');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// CRUD Operations
export const getTransactions = async (): Promise<Transaction[]> => {
  try {
    const result = await db.getAllAsync<any>('SELECT * FROM transactions ORDER BY date DESC;');
    
    // Ensure result is properly formatted
    return result
      .filter(row => row) // Remove undefined/null entries
      .map(row => ({
        id: row.id,
        title: row.title ?? "Untitled",
        amount: row.amount ?? 0,
        date: row.date ?? new Date().toISOString(),
        category: row.category ?? "Uncategorized",
        isRecurring: row.isRecurring === 1,
        recurringType: row.recurringType ?? null,
        recurringEndDate: row.recurringEndDate ?? null,
        receiptImage: row.receiptImage ?? null,
        comment: row.comment ?? null,
      }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

export const addTransaction = async (transaction: Omit<Transaction, 'id'>): Promise<string> => {
  try {
    const id = Math.random().toString(36).substr(2, 9);
    await db.runAsync(
      `INSERT INTO transactions (id, title, amount, date, category, isRecurring, recurringType, recurringEndDate, receiptImage, comment)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        transaction.title ?? "Untitled",
        transaction.amount ?? 0,
        transaction.date ?? new Date().toISOString(),
        transaction.category ?? "Uncategorized",
        transaction.isRecurring ? 1 : 0,
        transaction.recurringType ?? null,
        transaction.recurringEndDate ?? null,
        transaction.receiptImage ?? null,
        transaction.comment ?? null
      ]
    );
    return id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    await db.runAsync(
      `UPDATE transactions 
       SET title = ?, 
           amount = ?, 
           date = ?, 
           category = ?,
           isRecurring = ?,
           recurringType = ?,
           recurringEndDate = ?,
           receiptImage = ?,
           comment = ?
       WHERE id = ?;`,
      [
        transaction.title ?? "Untitled",
        transaction.amount ?? 0,
        transaction.date ?? new Date().toISOString(),
        transaction.category ?? "Uncategorized",
        transaction.isRecurring ? 1 : 0,
        transaction.recurringType ?? null,
        transaction.recurringEndDate ?? null,
        transaction.receiptImage ?? null,
        transaction.comment ?? null,
        transaction.id
      ]
    );
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  try {
    await db.runAsync('DELETE FROM transactions WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};

export const getDatabase = () => db;
