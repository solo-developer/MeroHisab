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
  walletImpact?: number;
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

  search: async (options: {
    query?: string;
    fromDate?: string;
    toDate?: string;
    type?: string;
    minAmount?: number;
    maxAmount?: number;
    categoryId?: number;
    limit?: number;
    offset?: number;
  }): Promise<TransactionSummaryRow[]> => {
    const db = getDatabase();
    const { query, fromDate, toDate, type, minAmount, maxAmount, categoryId, limit = 50, offset = 0 } = options;

    let sql = `
      SELECT 
        ts.id, ts.type, ts.note, ts.date, ts.amount as netAmount, c.name as categoryName,
        (
          SELECT SUM(CASE WHEN te.entryType = 'debit' THEN te.amount ELSE -te.amount END)
          FROM TransactionEntry te
          WHERE te.transactionSummaryId = ts.id
            AND te.ledgerId IN (SELECT ledgerId FROM wallets WHERE deletedAt IS NULL)
        ) as walletImpact
      FROM TransactionSummary ts
      LEFT JOIN categories c ON ts.categoryId = c.id
      WHERE ts.deletedAt IS NULL
    `;
    const params: any[] = [];

    if (fromDate) {
      sql += ' AND date(ts.date) >= ?';
      params.push(fromDate);
    }
    if (toDate) {
      sql += ' AND date(ts.date) <= ?';
      params.push(toDate);
    }
    if (type && type !== 'all') {
      sql += ' AND ts.type = ?';
      params.push(type);
    }
    if (categoryId) {
      sql += ' AND ts.categoryId = ?';
      params.push(categoryId);
    }
    if (minAmount !== undefined) {
      sql += ' AND ts.amount >= ?';
      params.push(minAmount);
    }
    if (maxAmount !== undefined) {
      sql += ' AND ts.amount <= ?';
      params.push(maxAmount);
    }
    if (query) {
      sql += ' AND (ts.note LIKE ? OR ts.type LIKE ? OR c.name LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += ' ORDER BY ts.date DESC, ts.id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(sql, params, (_: any, res: any) => {
          const result: TransactionSummaryRow[] = [];
          for (let i = 0; i < res.rows.length; i++) {
            result.push(res.rows.item(i));
          }
          resolve(result);
        }, (_: any, err: any) => {
          reject(err);
          return false;
        });
      });
    });
  },

  getIncomeExpense: async (options: {
    query?: string;
    fromDate?: string;
    toDate?: string;
    type?: string;
    minAmount?: number;
    maxAmount?: number;
    categoryId?: number;
  }): Promise<IncomeExpenseReport> => {
    const db = getDatabase();
    const { query, fromDate, toDate, type, minAmount, maxAmount, categoryId } = options;

    let sql = `
      SELECT 
        SUM(CASE WHEN ts.type IN ('income', 'receipt') THEN ts.amount ELSE 0 END) AS income,
        SUM(CASE WHEN ts.type IN ('expense', 'payment') THEN ts.amount ELSE 0 END) AS expense
      FROM TransactionSummary ts
      LEFT JOIN categories c ON ts.categoryId = c.id
      WHERE ts.deletedAt IS NULL
    `;
    const params: any[] = [];

    if (fromDate) {
      sql += ' AND date(ts.date) >= ?';
      params.push(fromDate);
    }
    if (toDate) {
      sql += ' AND date(ts.date) <= ?';
      params.push(toDate);
    }
    if (type && type !== 'all') {
      sql += ' AND ts.type = ?';
      params.push(type);
    }
    if (categoryId) {
      sql += ' AND ts.categoryId = ?';
      params.push(categoryId);
    }
    if (minAmount !== undefined) {
      sql += ' AND ts.amount >= ?';
      params.push(minAmount);
    }
    if (maxAmount !== undefined) {
      sql += ' AND ts.amount <= ?';
      params.push(maxAmount);
    }
    if (query) {
      sql += ' AND (ts.note LIKE ? OR ts.type LIKE ? OR c.name LIKE ?)';
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    return new Promise<IncomeExpenseReport>((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(sql, params, (_: any, res: any) => {
          const row = res.rows.item(0);
          resolve({ income: row.income ?? 0, expense: row.expense ?? 0 });
        }, (_: any, err: any) => {
          reject(err);
          return false;
        });
      });
    });
  },

  getWalletImpactSum: async (fromDate?: string, toDate?: string): Promise<number> => {
    const db = getDatabase();
    let sql = `
      SELECT 
        SUM(CASE WHEN te.entryType = 'debit' THEN te.amount ELSE -te.amount END) as impact
      FROM TransactionEntry te
      JOIN TransactionSummary ts ON te.transactionSummaryId = ts.id
      WHERE ts.deletedAt IS NULL 
        AND te.ledgerId IN (SELECT ledgerId FROM wallets WHERE deletedAt IS NULL)
    `;
    const params: any[] = [];
    if (fromDate) {
      sql += ' AND date(ts.date) >= ?';
      params.push(fromDate);
    }
    if (toDate) {
      sql += ' AND date(ts.date) <= ?';
      params.push(toDate);
    }

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(sql, params, (_: any, res: any) => {
          resolve(res.rows.item(0).impact || 0);
        }, (_: any, err: any) => {
          reject(err);
          return false;
        });
      });
    });
  }
};