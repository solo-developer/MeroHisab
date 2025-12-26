import { getDatabase } from './Database';

export interface TransactionSummaryCreate {
  type: string;
  note?: string;
  date: string;
  amount: number;
  categoryId?: number;
}
export interface TransactionSummaryRow {
  id: number;
  type: string;
  note?: string;
  date: string;
  netAmount: number;
}

export interface IncomeExpenseReport {
  income: number;
  expense: number;
}
export const TransactionSummaryRepository = {
  create: (
    tx: any,
    data: TransactionSummaryCreate,
    onSuccess: (id: number) => void,
    onError: (err: any) => void
  ) => {
    tx.executeSql(
      `INSERT INTO TransactionSummary (type, note, date,categoryId,amount)
       VALUES (?, ?, ?,?,?);`,
      [data.type, data.note || '', data.date, data.categoryId, data.amount],
      (_: any, res: any) => onSuccess(res.insertId),
      (_: any, err: any) => {
        onError(err);
        return false;
      }
    );
  },

  listWithNetAmount: (
    limit: number,
    offset: number,
    onSuccess: (rows: TransactionSummaryRow[]) => void,
    onError: (err: any) => void
  ) => {
    const db = getDatabase();
    db.transaction((tx: any) => {
      tx.executeSql(
        `
        SELECT 
          ts.id,
          ts.type,
          ts.note,
          ts.date,
          ts.amount as netAmount
        FROM TransactionSummary ts
        WHERE ts.deletedAt IS NULL
        GROUP BY ts.id
        ORDER BY ts.date DESC, ts.id DESC
        LIMIT ? OFFSET ?;
        `,
        [limit, offset],
        (_: any, res: any) => {
          const result: TransactionSummaryRow[] = [];
          for (let i = 0; i < res.rows.length; i++) {
            result.push(res.rows.item(i));
          }
          onSuccess(result);
        },
        (_: any, err: any) => {
          onError(err);
          return false;
        }
      );
    });
  },

  getIncomeExpense: async (from: string, to: string): Promise<IncomeExpenseReport> => {
    const db = getDatabase();

    return new Promise<IncomeExpenseReport>((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `
          SELECT 
            SUM(CASE WHEN type IN ('income', 'receipt') THEN amount ELSE 0 END) AS income,
            SUM(CASE WHEN type IN ('expense', 'payment') THEN amount ELSE 0 END) AS expense
          FROM TransactionSummary
          WHERE deletedAt IS NULL AND date(date) BETWEEN ? AND ?;
          `,
          [from, to],
          (_: any, res: any) => {
            const row = res.rows.item(0);
            resolve({ income: row.income ?? 0, expense: row.expense ?? 0 });
          },
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  },
};