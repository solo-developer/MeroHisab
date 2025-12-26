import { getDatabase } from './Database';

export interface BudgetMetric {
    categoryId: number;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    monthlyLimit: number;
    spent: number;
    remaining: number;
    usagePercentage: number;
}

export default class BudgetRepository {
    /**
     * Fetches metrics for a specific month (Format: YYYY-MM)
     */
    static getMonthlyMetrics(month: string): Promise<BudgetMetric[]> {
        const db = getDatabase();

        // Calculate start and end of month for transaction sum
        const [year, monthNum] = month.split('-').map(Number);
        const firstDay = new Date(year, monthNum - 1, 1).toISOString();
        const lastDay = new Date(year, monthNum, 0, 23, 59, 59).toISOString();

        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `
          SELECT 
            c.id, 
            c.name, 
            c.color, 
            c.icon, 
            COALESCE(cb.amount, 0) as monthlyLimit,
            SUM(CASE WHEN ts.type = 'expense' AND ts.date BETWEEN ? AND ? THEN ts.amount ELSE 0 END) as spent
          FROM categories c
          LEFT JOIN CategoryBudgets cb ON c.id = cb.categoryId AND cb.month = ?
          LEFT JOIN TransactionSummary ts ON c.id = ts.categoryId AND ts.deletedAt IS NULL
          WHERE c.deletedAt IS NULL AND (c.type = 'Expense' OR c.type = 'expense')
          GROUP BY c.id;
          `,
                    [firstDay, lastDay, month],
                    (_: any, res: any) => {
                        const metrics: BudgetMetric[] = [];
                        for (let i = 0; i < res.rows.length; i++) {
                            const r = res.rows.item(i);
                            const spent = r.spent || 0;
                            const limit = r.monthlyLimit || 0;

                            // Only include if a limit is set OR if there was spending (to show progress)
                            if (limit > 0 || spent > 0) {
                                metrics.push({
                                    categoryId: r.id,
                                    categoryName: r.name,
                                    categoryColor: r.color,
                                    categoryIcon: r.icon,
                                    monthlyLimit: limit,
                                    spent: spent,
                                    remaining: limit - spent,
                                    usagePercentage: limit > 0 ? (spent / limit) * 100 : 0
                                });
                            }
                        }
                        resolve(metrics);
                    },
                    (_: any, err: any) => reject(err)
                );
            });
        });
    }

    /**
     * Updates or sets a budget for a category and month
     */
    static setBudget(categoryId: number, month: string, amount: number): Promise<void> {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `INSERT OR REPLACE INTO CategoryBudgets (categoryId, month, amount) VALUES (?, ?, ?);`,
                    [categoryId, month, amount],
                    () => resolve(),
                    (_: any, err: any) => reject(err)
                );
            });
        });
    }

    /**
     * Gets all expense categories with their limits for a specific month
     */
    static getCategoryBudgets(month: string): Promise<any[]> {
        const db = getDatabase();
        return new Promise((resolve, reject) => {
            db.transaction((tx: any) => {
                tx.executeSql(
                    `
          SELECT c.id, c.name, c.icon, c.color, COALESCE(cb.amount, 0) as amount
          FROM categories c
          LEFT JOIN CategoryBudgets cb ON c.id = cb.categoryId AND cb.month = ?
          WHERE c.deletedAt IS NULL AND (c.type = 'Expense' OR c.type = 'expense')
          ORDER BY c.name;
          `,
                    [month],
                    (_: any, res: any) => {
                        const results = [];
                        for (let i = 0; i < res.rows.length; i++) {
                            results.push(res.rows.item(i));
                        }
                        resolve(results);
                    },
                    (_: any, err: any) => reject(err)
                );
            });
        });
    }
}
