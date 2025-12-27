
import { getDatabase } from './Database';

export interface IncomeReportRow {
  id: number;
  date: string;
  categoryName: string | null;
  walletName: string | null;
  note: string | null;
  amount: number;
}

const IncomeReportRepository = {
  /**
   * Get list of income transactions, optionally filtered by date range
   */
  getIncomeReport: (
    fromDate?: string,
    toDate?: string,
    keyword?: string,
    callback?: (rows: IncomeReportRow[]) => void
  ) => {
    // Legacy support or alias to search with defaults
    IncomeReportRepository.search({
      fromDate,
      toDate,
      query: keyword,
      limit: 1000,
      offset: 0
    }).then(rows => callback && callback(rows));
  },

  search: async (options: {
    query?: string;
    fromDate?: string;
    toDate?: string;
    limit?: number;
    offset?: number;
  }): Promise<IncomeReportRow[]> => {
    const db = getDatabase();
    const { query, fromDate, toDate, limit = 50, offset = 0 } = options;

    let sql = `
      SELECT
        ts.id,
        ts.date,
        ts.note,
        ts.amount,
        c.name as categoryName,
        w.name as walletName
      FROM TransactionSummary ts
      LEFT JOIN categories c ON ts.categoryId = c.id
      LEFT JOIN TransactionEntry te ON te.transactionSummaryId = ts.id AND te.entryType='credit'
      LEFT JOIN wallets w ON te.ledgerId = w.ledgerId
      WHERE ts.type = 'income' AND ts.deletedAt IS NULL
    `;

    const params: any[] = [];

    if (fromDate) {
      sql += ` AND date(ts.date) >= date(?)`;
      params.push(fromDate);
    }
    if (toDate) {
      sql += ` AND date(ts.date) <= date(?)`;
      params.push(toDate);
    }
    if (query) {
      sql += ` AND (ts.note LIKE ? OR c.name LIKE ? OR w.name LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`, `%${query}%`);
    }

    sql += ` ORDER BY ts.date DESC, ts.id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          params,
          (_: any, results: any) => {
            const rows: IncomeReportRow[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              rows.push(results.rows.item(i));
            }
            resolve(rows);
          },
          (_: any, error: any) => {
            console.error('IncomeReportRepository.search error:', error);
            reject(error);
            return false;
          }
        );
      });
    });
  },
  
  // Helper to get total for filters only (ignoring pagination limits)
  getTotalAmount: async (options: {
    query?: string;
    fromDate?: string;
    toDate?: string;
  }): Promise<number> => {
     const db = getDatabase();
     const { query, fromDate, toDate } = options;
     
    let sql = `
      SELECT SUM(ts.amount) as total
      FROM TransactionSummary ts
      LEFT JOIN categories c ON ts.categoryId = c.id
      LEFT JOIN TransactionEntry te ON te.transactionSummaryId = ts.id AND te.entryType='credit'
      LEFT JOIN wallets w ON te.ledgerId = w.ledgerId
      WHERE ts.type = 'income' AND ts.deletedAt IS NULL
    `;

    const params: any[] = [];

    if (fromDate) {
      sql += ` AND date(ts.date) >= date(?)`;
      params.push(fromDate);
    }
    if (toDate) {
      sql += ` AND date(ts.date) <= date(?)`;
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
};

export { IncomeReportRepository };
export default IncomeReportRepository;
