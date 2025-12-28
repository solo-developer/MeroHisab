import { getDatabase } from './Database';

export interface RecurringTransaction {
    id: number;
    type: 'expense' | 'income';
    amount: number;
    categoryId: number;
    walletId: number;
    note?: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    dayOfMonth?: number;
    dayOfWeek?: number;
    monthOfYear?: number;
    startDate: string;
    lastProcessedDate?: string;
    nextRunDate: string;
    isActive: number;
    categoryName?: string;
    walletName?: string;
}

export interface CreateRecurringTransaction {
    type: 'expense' | 'income';
    amount: number;
    categoryId: number;
    walletId: number;
    note?: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    dayOfMonth?: number;
    dayOfWeek?: number;
    monthOfYear?: number;
    startDate: string;
    nextRunDate: string;
}

export const RecurringTransactionRepository = {
    create: async (data: CreateRecurringTransaction): Promise<number> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `INSERT INTO RecurringTransactions (
            type, amount, categoryId, walletId, note, frequency, 
            dayOfMonth, dayOfWeek, monthOfYear, startDate, nextRunDate
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
                    [
                        data.type, data.amount, data.categoryId, data.walletId,
                        data.note || '', data.frequency, data.dayOfMonth || null,
                        data.dayOfWeek || null, data.monthOfYear || null,
                        data.startDate, data.nextRunDate
                    ],
                    (_, res) => resolve(res.insertId),
                    (_, err) => {
                        reject(err);
                        return false;
                    }
                );
            });
        });
    },

    getAll: async (): Promise<RecurringTransaction[]> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `SELECT rt.*, c.name as categoryName, w.name as walletName 
           FROM RecurringTransactions rt
           JOIN categories c ON rt.categoryId = c.id
           JOIN wallets w ON rt.walletId = w.id
           ORDER BY rt.createdAt DESC`,
                    [],
                    (_, res) => {
                        const rows: RecurringTransaction[] = [];
                        for (let i = 0; i < res.rows.length; i++) {
                            rows.push(res.rows.item(i));
                        }
                        resolve(rows);
                    },
                    (_, err) => {
                        reject(err);
                        return false;
                    }
                );
            });
        });
    },

    getPending: async (currentDate: string): Promise<RecurringTransaction[]> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `SELECT * FROM RecurringTransactions 
           WHERE isActive = 1 AND nextRunDate <= ?`,
                    [currentDate],
                    (_, res) => {
                        const rows: RecurringTransaction[] = [];
                        for (let i = 0; i < res.rows.length; i++) {
                            rows.push(res.rows.item(i));
                        }
                        resolve(rows);
                    },
                    (_, err) => {
                        reject(err);
                        return false;
                    }
                );
            });
        });
    },

    updateLastProcessed: async (id: number, lastDate: string, nextDate: string): Promise<void> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `UPDATE RecurringTransactions 
           SET lastProcessedDate = ?, nextRunDate = ?
           WHERE id = ?`,
                    [lastDate, nextDate, id],
                    () => resolve(),
                    (_, err) => {
                        reject(err);
                        return false;
                    }
                );
            });
        });
    },

    delete: async (id: number): Promise<void> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `DELETE FROM RecurringTransactions WHERE id = ?`,
                    [id],
                    () => resolve(),
                    (_, err) => {
                        reject(err);
                        return false;
                    }
                );
            });
        });
    },

    toggleStatus: async (id: number, status: number): Promise<void> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction(tx => {
                tx.executeSql(
                    `UPDATE RecurringTransactions SET isActive = ? WHERE id = ?`,
                    [status, id],
                    () => resolve(),
                    (_, err) => {
                        reject(err);
                        return false;
                    }
                );
            });
        });
    }
};
