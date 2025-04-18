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
  userId: string;
}

export interface User {
  id: string;
  email: string; // Use email instead of username
  password: string; // In a real-world app, store hashed passwords
}

// Initialize database
export const initDatabase = async () => {
  try {
    // Create transactions table if it doesn't exist
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
        comment TEXT,
        userId TEXT NOT NULL DEFAULT 'unknown', -- Add a default value for userId
        FOREIGN KEY (userId) REFERENCES users (id)
      );
    `);

    // Create users table if it doesn't exist
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY NOT NULL,
        email TEXT UNIQUE NOT NULL, -- Use email instead of username
        password TEXT NOT NULL
      );
    `);

    // Check existing columns in the transactions table
    const tableInfo = await db.getAllAsync("PRAGMA table_info(transactions);");
    const columns = tableInfo.map((col: any) => col.name);

    if (!columns.includes('userId')) {
      // Add the userId column with a default value
      await db.execAsync(`ALTER TABLE transactions ADD COLUMN userId TEXT DEFAULT 'unknown';`);
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
        userId: row.userId
      }));
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
};

// Add a transaction with userId
export const addTransaction = async (transaction: Omit<Transaction, 'id'> & { userId: string }): Promise<string> => {
  try {
    const id = Math.random().toString(36).substr(2, 9);
    await db.runAsync(
      `INSERT INTO transactions (id, title, amount, date, category, isRecurring, recurringType, recurringEndDate, receiptImage, comment, userId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
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
        transaction.comment ?? null,
        transaction.userId
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
           comment = ?,
           userId = ?
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
        transaction.userId,
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

// User Operations
export const signupUser = async (email: string, password: string): Promise<string> => {
  try {
    // Use getAllAsync instead of getAllSync
    const existingUser = await db.getAllAsync<User>(
      `SELECT * FROM users WHERE email = ?;`, [email]
    );

    if (existingUser.length > 0) {
      throw new Error('Email already exists. Please use a different email.');
    }

    const id = Math.random().toString(36).substr(2, 9);
    await db.runAsync(
      `INSERT INTO users (id, email, password) VALUES (?, ?, ?);`,
      [id, email, password]
    );

    return id;
  } catch (error) {
    console.error('Error signing up user:', error);
    throw error;
  }
};

export const loginUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const result = db.getAllSync<User>(
      `SELECT * FROM users WHERE email = ? AND password = ?;`,
      [email, password]
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
};

// Fetch user-specific transactions
export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const result = await db.getAllAsync<any>(
      `SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC;`,
      [userId]
    );

    return result.map(row => ({
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
      userId: row.userId
    }));
  } catch (error) {
    console.error('Error fetching user transactions:', error);
    throw error;
  }
};

export const getUserById = async (id: string): Promise<User | null> => {
  try {
    const result = await db.getAllAsync<User>(
      `SELECT * FROM users WHERE id = ? LIMIT 1;`,
      [id]
    );

    if (result && result.length > 0) {
      return {
        id: result[0].id,
        email: result[0].email,
        password: result[0].password
      };
    }

    return null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};
