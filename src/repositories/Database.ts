import SQLite from 'react-native-sqlite-2';

let db: SQLite.Database | null = null;

/**
 * Returns singleton database instance
 */
export const getDatabase = (): SQLite.Database => {
  if (!db) {
    db = SQLite.openDatabase(
      'MeroHisab.db',
      '1.0',
      'Mero Hisab Database',
      20000000,
    );
  }
  return db;
};

/**
 * Initialize database schema
 */
export const initDatabase = (): Promise<void> => {
  const database = getDatabase();

  return new Promise((resolve, reject) => {
    database.transaction(
      tx => {
        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS Ledger (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT CHECK(type IN ('asset','expense','income','liability','equity')) NOT NULL,
            isSystem INTEGER DEFAULT 0,
            code TEXT UNIQUE,
            deletedAt DATETIME DEFAULT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS LedgerDailyBalance (
            ledgerId INTEGER NOT NULL,
            date TEXT NOT NULL,
            openingBalance REAL NOT NULL DEFAULT 0,
            closingBalance REAL NOT NULL DEFAULT 0,
            PRIMARY KEY (ledgerId, date),
            FOREIGN KEY (ledgerId) REFERENCES Ledger(id)
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            icon TEXT,
            color TEXT,
            ledgerId INTEGER,
            deletedAt DATETIME DEFAULT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ledgerId) REFERENCES Ledger(id)
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS CategoryBudgets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            categoryId INTEGER NOT NULL,
            month TEXT NOT NULL, -- Format: YYYY-MM
            amount REAL NOT NULL DEFAULT 0,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(categoryId, month),
            FOREIGN KEY (categoryId) REFERENCES categories(id)
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS wallets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            balance REAL DEFAULT 0,
            ledgerId INTEGER,
            deletedAt DATETIME DEFAULT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ledgerId) REFERENCES Ledger(id)
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS TransactionSummary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT CHECK(type IN ('expense','income','transfer','adjustment','payment','receipt')) NOT NULL,
            categoryId INTEGER DEFAULT NULL,
            amount REAL NOT NULL,
            date DATETIME NOT NULL,
            note TEXT,
            deletedAt DATETIME DEFAULT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(categoryId) REFERENCES categories(id)
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS TransactionEntry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transactionSummaryId INTEGER NOT NULL,
            ledgerId INTEGER NOT NULL,
            entryType TEXT CHECK(entryType IN ('debit','credit')) NOT NULL,
            amount REAL NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (transactionSummaryId) REFERENCES TransactionSummary(id),
            FOREIGN KEY (ledgerId) REFERENCES Ledger(id)
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS Transfer (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            transactionSummaryId INTEGER NOT NULL,
            fromLedgerId INTEGER,
            toLedgerId INTEGER,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (transactionSummaryId) REFERENCES TransactionSummary(id),
            FOREIGN KEY (fromLedgerId) REFERENCES Ledger(id),
            FOREIGN KEY (toLedgerId) REFERENCES Ledger(id)
          );
        `);

        tx.executeSql(`
          INSERT OR IGNORE INTO Ledger (name, type, isSystem, code)
          VALUES 
            ('Discount Given', 'expense', 1, 'DISCOUNT_GIVEN'),
            ('Discount Received', 'income', 1, 'DISCOUNT_RECEIVED');
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS MetaCategory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS MetaCategoryItems (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            metaCategoryId INTEGER NOT NULL,
            ledgerId INTEGER NOT NULL,
            FOREIGN KEY (ledgerId) REFERENCES Ledger(id) ON DELETE CASCADE
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS Reminders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            date TEXT NOT NULL,
            isRecurring INTEGER DEFAULT 0,
            frequency TEXT,
            notificationId TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS Parties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT CHECK(type IN ('debtor','creditor')) NOT NULL,
            initialBalance REAL DEFAULT 0,
            ledgerId INTEGER,
            deletedAt DATETIME DEFAULT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ledgerId) REFERENCES Ledger(id)
          );
        `);

        tx.executeSql(`
          CREATE TABLE IF NOT EXISTS PartyBalance (
            partyId INTEGER PRIMARY KEY,
            currentBalance REAL DEFAULT 0,
            lastUpdated DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (partyId) REFERENCES Parties(id) ON DELETE CASCADE
          );
        `);

        tx.executeSql(`
          ALTER TABLE categories ADD COLUMN monthlyLimit REAL DEFAULT 0;
        `, [], () => { }, () => {
          // Ignore error if column already exists
        });
      },
      error => {
        console.error('DB init error:', error);
        reject(error);
      },
      () => {
        console.log('DB initialized');
        resolve();
      },
    );
  });
};

