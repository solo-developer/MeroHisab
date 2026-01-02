import { getDatabase } from './Database';

interface DailySummary {
    date: string;
    income: number;
    expense: number;
}

export const CalendarRepository = {
    getDailySummaries: async (year: number, month: number): Promise<Record<string, DailySummary>> => {
        const db = getDatabase();
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;

        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `
                    SELECT 
                        DATE(date) as date,
                        SUM(CASE WHEN type='income' THEN amount ELSE 0 END) as income,
                        SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) as expense
                    FROM TransactionSummary
                    WHERE strftime('%Y-%m', date) = ? AND deletedAt IS NULL
                    GROUP BY DATE(date)
                    `,
                    [monthStr],
                    (_: any, res: any) => {
                        const map: Record<string, DailySummary> = {};
                        for (let i = 0; i < res.rows.length; i++) {
                            const item = res.rows.item(i);
                            map[item.date] = {
                                date: item.date,
                                income: item.income,
                                expense: item.expense
                            };
                        }
                        resolve(map);
                    },
                    (_: any, err: any) => reject(err)
                );
            });
        });
    },

    getDayTransactions: async (dateStr: string): Promise<any[]> => {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
             db.transaction((tx: any) => {
                tx.executeSql(
                    `
                    SELECT ts.*, c.name as categoryName, c.icon as categoryIcon, c.color as categoryColor,
                           w.name as walletName
                    FROM TransactionSummary ts
                    LEFT JOIN categories c ON ts.categoryId = c.id
                    LEFT JOIN TransactionEntry te ON ts.id = te.transactionSummaryId AND te.entryType = (CASE WHEN ts.type='income' THEN 'debit' ELSE 'credit' END)
                    LEFT JOIN Ledger l ON te.ledgerId = l.id
                    LEFT JOIN wallets w ON w.ledgerId = l.id
                    WHERE DATE(ts.date) = ? AND ts.deletedAt IS NULL
                    GROUP BY ts.id
                    ORDER BY ts.date DESC
                    `,
                    [dateStr],
                     (_: any, res: any) => {
                        const rows = [];
                        for (let i = 0; i < res.rows.length; i++) {
                            rows.push(res.rows.item(i));
                        }
                        resolve(rows);
                    },
                    (_: any, err: any) => reject(err)
                );
             });
        });
    }
};
