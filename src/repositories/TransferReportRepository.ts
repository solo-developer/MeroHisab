import { getDatabase } from './Database';

export interface TransferReportRow {
  id: number;
  date: string;
  fromWallet: string | null;
  toWallet: string | null;
  amount: number;
  note: string | null;
}

const TransferReportRepository = {
  /**
   * Fetch transfer transactions optionally filtered by date range
   */
  getTransferReport: (
    fromDate?: string,
    toDate?: string,
    keyword?: string,
    callback?: (rows: TransferReportRow[]) => void
  ) => {
    // Legacy support
    TransferReportRepository.search({
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
  }): Promise<TransferReportRow[]> => {
    const db = getDatabase();
    const { query, fromDate, toDate, limit = 50, offset = 0 } = options;

    let sql = `
      SELECT
        ts.id,
        ts.date,
        ts.amount,
        ts.note,
        wFrom.name as fromWallet,
        wTo.name as toWallet
      FROM TransactionSummary ts
      INNER JOIN Transfer t ON ts.id = t.transactionSummaryId
      LEFT JOIN wallets wFrom ON t.fromLedgerId = wFrom.ledgerId
      LEFT JOIN wallets wTo ON t.toLedgerId = wTo.ledgerId
      WHERE ts.type = 'transfer' AND ts.deletedAt IS NULL
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
      sql += ` AND (ts.note LIKE ? OR wFrom.name LIKE ? OR wTo.name LIKE ?)`;
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
                const rows: TransferReportRow[] = [];
                for (let i = 0; i < results.rows.length; i++) {
                  rows.push(results.rows.item(i));
                }
                resolve(rows);
              },
              (_: any, error: any) => {
                console.error('TransferReportRepository.search error:', error);
                reject(error);
                return false;
              }
            );
          });
    });
  },

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
        INNER JOIN Transfer t ON ts.id = t.transactionSummaryId
        LEFT JOIN wallets wFrom ON t.fromLedgerId = wFrom.ledgerId
        LEFT JOIN wallets wTo ON t.toLedgerId = wTo.ledgerId
        WHERE ts.type = 'transfer' AND ts.deletedAt IS NULL
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
        sql += ` AND (ts.note LIKE ? OR wFrom.name LIKE ? OR wTo.name LIKE ?)`;
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

export { TransferReportRepository };
export default TransferReportRepository;
