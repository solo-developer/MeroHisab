import { getDatabase } from './Database';

export interface ExpenseReportRow {
  id: number;
  date: string;
  amount: number;
  note?: string;
  categoryName?: string;
  walletName?: string;
}

export class ExpenseReportRepository {
  static getExpenseReport(
    fromDate: string,
    toDate: string,
    keyword: string,
    callback: (rows: ExpenseReportRow[], total: number) => void,
  ) {
    // Legacy support
     ExpenseReportRepository.search({
       fromDate,
       toDate,
       query: keyword,
       limit: 1000,
       offset: 0
     }).then(async (rows) => {
         const total = await ExpenseReportRepository.getTotalAmount({fromDate, toDate, query: keyword});
         callback(rows, total);
     });
  }

  static async search(options: {
    query?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<ExpenseReportRow[]> {
    const db = getDatabase();
    const { query, fromDate, toDate, limit = 50, offset = 0 } = options;

    let sql = `
      SELECT
        ts.id,
        ts.date,
        ts.amount,
        ts.note,
        c.name AS categoryName,
        w.name AS walletName
      FROM TransactionSummary ts
      LEFT JOIN categories c ON c.id = ts.categoryId
      LEFT JOIN TransactionEntry te ON te.transactionSummaryId = ts.id AND te.entryType='debit'
      LEFT JOIN wallets w ON te.ledgerId = w.ledgerId
      WHERE ts.type = 'expense'
        AND ts.deletedAt IS NULL
    `;
    const params: any[] = [];

    if (fromDate) {
        sql += ` AND DATE(ts.date) >= DATE(?)`;
        params.push(fromDate);
    }
    if (toDate) {
        sql += ` AND DATE(ts.date) <= DATE(?)`;
        params.push(toDate);
    }

    if (query) {
      sql += ` AND (ts.note LIKE ? OR c.name LIKE ? OR w.name LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += ` GROUP BY ts.id ORDER BY ts.date DESC, ts.id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return new Promise((resolve, reject) => {
        db.transaction((tx: any) => {
            tx.executeSql(
              sql,
              params,
              (_: any, result: any) => {
                const rows: ExpenseReportRow[] = [];
                for (let i = 0; i < result.rows.length; i++) {
                  rows.push(result.rows.item(i));
                }
                resolve(rows);
              },
              (_: any, error: any) => {
                console.error('ExpenseReport query failed', error);
                reject(error);
                return false;
              },
            );
          });
    });
  }
  
  static async getTotalAmount(options: {
    query?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<number> {
      const db = getDatabase();
      const { query, fromDate, toDate } = options;

      let sql = `
        SELECT SUM(ts.amount) as total
        FROM TransactionSummary ts
        LEFT JOIN categories c ON c.id = ts.categoryId
        LEFT JOIN TransactionEntry te ON te.transactionSummaryId = ts.id AND te.entryType='debit'
        LEFT JOIN wallets w ON te.ledgerId = w.ledgerId
        WHERE ts.type = 'expense'
          AND ts.deletedAt IS NULL
      `;
      const params: any[] = [];

      if (fromDate) {
          sql += ` AND DATE(ts.date) >= DATE(?)`;
          params.push(fromDate);
      }
      if (toDate) {
          sql += ` AND DATE(ts.date) <= DATE(?)`;
          params.push(toDate);
      }

      if (query) {
        sql += ` AND (ts.note LIKE ? OR c.name LIKE ? OR w.name LIKE ?)`;
        params.push(`%${query}%`, `%${query}%`, `%${query}%`);
      }
      
      return new Promise((resolve, reject) => {
          db.transaction((tx: any) => {
              tx.executeSql(sql, params, (_: any, res: any) => {
                  resolve(res.rows.item(0).total || 0);
              }, (_: any, err: any) => reject(err));
          });
      });
  }
}
