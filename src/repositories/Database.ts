import SQLite from 'react-native-sqlite-2';

let db: SQLite.Database | null = null;

/**
 * Returns the database instance (singleton)
 */
export const getDatabase = (): SQLite.Database => {
  if (!db) {
    db = SQLite.openDatabase(
      'MeroHisab.db',
      '1.0',
      'Mero Hisab Database',
      200000,
    );
  }
  return db;
};

/**
 * Initializes the database: creates tables if they don't exist
 */
export const initDatabase = (): void => {
  const database = getDatabase();

  database.transaction(tx => {
    // Categories table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        icon TEXT,
        color TEXT
      );`,
    );

    // Accounts table (example)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        balance REAL DEFAULT 0
      );`,
    );

    // Transactions table (example)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId INTEGER,
        accountId INTEGER,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        FOREIGN KEY(categoryId) REFERENCES categories(id),
        FOREIGN KEY(accountId) REFERENCES accounts(id)
      );`,
    );

    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        balance REAL DEFAULT 0
      );
    `);
  });
};
