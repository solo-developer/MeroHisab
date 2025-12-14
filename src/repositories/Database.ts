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
      200000,
    );
  }
  return db;
};

/**
 * Initialize database schema
 */
export const initDatabase = (): void => {
  const database = getDatabase();

  database.transaction(tx => {
    /* =====================================================
     * LEDGER (new core accounting table)
     * ===================================================== */
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS Ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        type TEXT CHECK(type IN ('asset','expense','income','liability','equity')) NOT NULL,
        isSystem INTEGER DEFAULT 0,
        deletedAt DATETIME DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add inside initDatabase() transaction callback
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

    /* =====================================================
     * CATEGORIES (extended with ledgerId)
     * ===================================================== */
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

    /* =====================================================
     * WALLETS (extended with ledgerId)
     * ===================================================== */
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

    /* =====================================================
     * TRANSACTIONS (legacy – kept for UI continuity)
     * ===================================================== */
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        categoryId INTEGER,
        walletId INTEGER,
        amount REAL NOT NULL,
        date TEXT NOT NULL,
        note TEXT,
        deletedAt DATETIME DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (categoryId) REFERENCES categories(id),
        FOREIGN KEY (walletId) REFERENCES wallets(id)
      );
    `);

    /* =====================================================
     * TRANSACTION SUMMARY (ledger grouping)
     * ===================================================== */
    tx.executeSql(`
      CREATE TABLE IF NOT EXISTS TransactionSummary (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT CHECK(type IN ('expense','income','transfer','adjustment')) NOT NULL,
        date DATETIME NOT NULL,
        note TEXT,
        deletedAt DATETIME DEFAULT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* =====================================================
     * TRANSACTION ENTRY (double-entry ledger)
     * ===================================================== */
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

    /* =====================================================
     * TRANSFER (helper table)
     * ===================================================== */
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
  });
};
