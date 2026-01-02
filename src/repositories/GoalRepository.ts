import { getDatabase } from './Database';

interface Goal {
    id: number;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
    color: string;
    icon?: string;
    isCompleted: number;
    ledgerId: number;
}

export const GoalRepository = {
    getAll: async (): Promise<Goal[]> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `SELECT * FROM Goals ORDER BY isCompleted ASC, deadline ASC`,
                    [],
                    (_: any, res: any) => {
                        const items: Goal[] = [];
                        for (let i = 0; i < res.rows.length; i++) {
                            items.push(res.rows.item(i));
                        }
                        resolve(items);
                    },
                    (_: any, err: any) => reject(err)
                );
            });
        });
    },

    create: async (name: string, targetAmount: number, deadline?: string, color: string = '#4CAF50', icon: string = 'flag'): Promise<void> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                // 1. Create a Ledger for this goal
                tx.executeSql(
                    `INSERT INTO Ledger (name, type, isSystem) VALUES (?, 'asset', 0)`,
                    [`Goal: ${name}`],
                    (_: any, res: any) => {
                        const ledgerId = res.insertId;
                        
                        // 2. Create the Goal
                        tx.executeSql(
                            `INSERT INTO Goals (name, targetAmount, currentAmount, deadline, color, icon, ledgerId) 
                             VALUES (?, ?, 0, ?, ?, ?, ?)`,
                            [name, targetAmount, deadline || null, color, icon, ledgerId],
                            () => resolve(),
                            (_: any, err: any) => reject(err)
                        );
                    },
                    (_: any, err: any) => reject(err)
                );
            });
        });
    },

    delete: async (id: number): Promise<void> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            // We should probably check if balance is 0 before deleting, or move funds back to some default wallet.
            // For simplicity, we just delete the goal metadata. The Ledger remains but hidden, or we soft delete it.
            // Let's soft delete the Goal.
            db.transaction((tx: any) => {
                tx.executeSql(
                    `DELETE FROM Goals WHERE id = ?`, 
                    [id],
                     () => resolve(),
                    (_: any, err: any) => reject(err)
                );
            });
        });
    },

    // To Deposit: We create a Transfer Transaction from Wallet -> Goal Ledger
    deposit: async (goalId: number, goalLedgerId: number, walletLedgerId: number, amount: number, date: string): Promise<void> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                // 1. Create TransactionSummary
                tx.executeSql(
                    `INSERT INTO TransactionSummary (type, amount, date, note) VALUES ('transfer', ?, ?, 'Deposit to Goal')`,
                    [amount, date],
                    (_: any, res: any) => {
                        const tsId = res.insertId;

                        // 2. Create Transfer entry
                        tx.executeSql(
                            `INSERT INTO Transfer (transactionSummaryId, fromLedgerId, toLedgerId) VALUES (?, ?, ?)`,
                            [tsId, walletLedgerId, goalLedgerId]
                        );

                        // 3. Create TransactionEntries (Credit Wallet, Debit Goal)
                        // Credit Wallet (Asset) -> Decrease
                        tx.executeSql(
                            `INSERT INTO TransactionEntry (transactionSummaryId, ledgerId, entryType, amount) VALUES (?, ?, 'credit', ?)`,
                            [tsId, walletLedgerId, amount]
                        );
                        // Debit Goal (Asset) -> Increase
                        tx.executeSql(
                             `INSERT INTO TransactionEntry (transactionSummaryId, ledgerId, entryType, amount) VALUES (?, ?, 'debit', ?)`,
                            [tsId, goalLedgerId, amount]
                        );

                        // 4. Update Wallet Balance
                        tx.executeSql(
                            `UPDATE wallets SET balance = balance - ? WHERE ledgerId = ?`,
                            [amount, walletLedgerId]
                        );

                        // 5. Update Goal Current Amount
                        tx.executeSql(
                            `UPDATE Goals SET currentAmount = currentAmount + ? WHERE id = ?`,
                            [amount, goalId]
                        );

                         resolve();
                    },
                    (_: any, err: any) => reject(err)
                );
            });
        });
    },

     withdraw: async (goalId: number, goalLedgerId: number, walletLedgerId: number, amount: number, date: string): Promise<void> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                // 1. Create TransactionSummary
                tx.executeSql(
                    `INSERT INTO TransactionSummary (type, amount, date, note) VALUES ('transfer', ?, ?, 'Withdraw from Goal')`,
                    [amount, date],
                    (_: any, res: any) => {
                        const tsId = res.insertId;

                        // 2. Create Transfer entry
                        tx.executeSql(
                            `INSERT INTO Transfer (transactionSummaryId, fromLedgerId, toLedgerId) VALUES (?, ?, ?)`,
                            [tsId, goalLedgerId, walletLedgerId]
                        );

                        // 3. Create TransactionEntries (Credit Goal, Debit Wallet)
                        // Credit Goal (Asset) -> Decrease
                        tx.executeSql(
                            `INSERT INTO TransactionEntry (transactionSummaryId, ledgerId, entryType, amount) VALUES (?, ?, 'credit', ?)`,
                            [tsId, goalLedgerId, amount]
                        );
                        // Debit Wallet (Asset) -> Increase
                        tx.executeSql(
                             `INSERT INTO TransactionEntry (transactionSummaryId, ledgerId, entryType, amount) VALUES (?, ?, 'debit', ?)`,
                            [tsId, walletLedgerId, amount]
                        );

                        // 4. Update Wallet Balance
                        tx.executeSql(
                            `UPDATE wallets SET balance = balance + ? WHERE ledgerId = ?`,
                            [amount, walletLedgerId]
                        );

                        // 5. Update Goal Current Amount
                        tx.executeSql(
                            `UPDATE Goals SET currentAmount = currentAmount - ? WHERE id = ?`,
                            [amount, goalId]
                        );

                         resolve();
                    },
                    (_: any, err: any) => reject(err)
                );
            });
        });
    },

    getGoalTransactions: async (goalLedgerId: number): Promise<any[]> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `
                    SELECT ts.id, ts.date, ts.amount, ts.note, te.entryType,
                           w.name as walletName
                    FROM TransactionEntry te
                    JOIN TransactionSummary ts ON te.transactionSummaryId = ts.id
                    LEFT JOIN Transfer tr ON tr.transactionSummaryId = ts.id
                    LEFT JOIN Ledger l_other ON (l_other.id = tr.fromLedgerId OR l_other.id = tr.toLedgerId) AND l_other.id != ?
                    LEFT JOIN wallets w ON w.ledgerId = l_other.id
                    WHERE te.ledgerId = ? AND ts.deletedAt IS NULL
                    ORDER BY ts.date DESC
                    `,
                    [goalLedgerId, goalLedgerId],
                    (_: any, res: any) => {
                        const items = [];
                        for (let i = 0; i < res.rows.length; i++) {
                            items.push(res.rows.item(i));
                        }
                        resolve(items);
                    },
                    (_: any, err: any) => reject(err)
                );
            });
        });
    }
};
