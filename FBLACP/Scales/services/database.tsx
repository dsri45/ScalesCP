import * as SQLite from 'expo-sqlite';

// Open/create the database
const db = SQLite.openDatabaseSync('fblacp.db');

// Types
export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  type: string;
  category: string;
<<<<<<< HEAD
  description: string;
  date: string;
  createdAt: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  password: string;
  createdAt: string;
=======
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: string | null;
  receiptImage?: string | null;
  comment?: string | null;
>>>>>>> d8105771b46106b56a8b2366682931a4b2ce5903
}

// Initialize database
export const initDatabase = async () => {
  try {
<<<<<<< HEAD
    // Create users table if it doesn't exist
    await new Promise<void>((resolve, reject) => {
      db.execAsync(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE,
          password TEXT,
          createdAt TEXT
        );
      `).then(() => resolve()).catch(reject);
    });

    // Create transactions table if it doesn't exist
    await new Promise<void>((resolve, reject) => {
      db.execAsync(`
        CREATE TABLE IF NOT EXISTS transactions (
          id TEXT PRIMARY KEY,
          userId TEXT,
          amount REAL,
          type TEXT,
          category TEXT,
          description TEXT,
          date TEXT,
          createdAt TEXT,
          FOREIGN KEY (userId) REFERENCES users (id)
        );
      `).then(() => resolve()).catch(reject);
    });
=======
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
>>>>>>> d8105771b46106b56a8b2366682931a4b2ce5903

    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Initialize database when the module is imported
initDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
});

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
};

// User Authentication Functions
export const createUser = async (email: string, password: string): Promise<User> => {
  const database = getDatabase();
  try {
<<<<<<< HEAD
    const id = Math.random().toString(36).substr(2, 9);
    await database.runAsync(
      `INSERT INTO users (id, email, password, createdAt)
       VALUES (?, ?, ?, ?);`,
      [id, email, password, new Date().toISOString()]
    );
    return { id, email, password, createdAt: new Date().toISOString() };
=======
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
>>>>>>> d8105771b46106b56a8b2366682931a4b2ce5903
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const database = getDatabase();
  try {
    const result = await database.getAllAsync<any>('SELECT * FROM users WHERE email = ?;', [email]);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// CRUD Operations
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
  try {
    const result = await db.getAllAsync<any>('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC;', [userId]);
    return result.map(row => ({
      id: row.id,
      userId: row.userId,
      amount: row.amount,
      type: row.type,
      category: row.category,
      description: row.description,
      date: row.date,
      createdAt: row.createdAt
    }));
  } catch (error) {
    console.error('Error getting transactions:', error);
    throw error;
  }
};

export const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>): Promise<Transaction> => {
  try {
    const id = Math.random().toString(36).substr(2, 9);
    const createdAt = new Date().toISOString();
    
    await db.runAsync(
<<<<<<< HEAD
      `INSERT INTO transactions (id, userId, amount, type, category, description, date, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        transaction.userId,
        transaction.amount,
        transaction.type,
        transaction.category,
        transaction.description,
        transaction.date,
        createdAt
=======
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
>>>>>>> d8105771b46106b56a8b2366682931a4b2ce5903
      ]
    );
    
    return { 
      id, 
      ...transaction, 
      createdAt 
    };
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const updateTransaction = async (transaction: Transaction): Promise<void> => {
  try {
    await db.runAsync(
      `UPDATE transactions 
       SET amount = ?, 
           type = ?,
           category = ?,
<<<<<<< HEAD
           description = ?,
           date = ?
       WHERE id = ? AND userId = ?;`,
      [
        transaction.amount,
        transaction.type,
        transaction.category,
        transaction.description,
        transaction.date,
        transaction.id,
        transaction.userId
=======
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
>>>>>>> d8105771b46106b56a8b2366682931a4b2ce5903
      ]
    );
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
};

export const deleteTransaction = async (id: string): Promise<void> => {
  const database = getDatabase();
  try {
    await database.runAsync('DELETE FROM transactions WHERE id = ?;', [id]);
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
};
