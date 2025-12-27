// src/repositories/IncomeReportRepository.ts
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
   * @param fromDate format: 'YYYY-MM-DD'
   * @param toDate format: 'YYYY-MM-DD'
   * @param callback returns IncomeReportRow[]
   */
  getIncomeReport: (
    fromDate?: string,
    toDate?: string,
    keyword?: string,
    callback?: (rows: IncomeReportRow[]) => void
  ) => {
    const db = getDatabase();

    let query = `
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
      query += ` AND date(ts.date) >= date(?)`;
      params.push(fromDate);
    }

    if (toDate) {
      query += ` AND date(ts.date) <= date(?)`;
      params.push(toDate);
    }

    if (keyword) {
      query += ` AND (ts.note LIKE ? OR c.name LIKE ? OR w.name LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    query += ` ORDER BY ts.date DESC, ts.id DESC`;

    db.transaction((tx: any) => {
      tx.executeSql(
        query,
        params,
        (_: any, results: any) => {
          const rows: IncomeReportRow[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            rows.push(results.rows.item(i));
          }
          callback && callback(rows);
        },
        (_: any, error: any) => {
          console.error('IncomeReportRepository.getIncomeReport error:', error);
          return false;
        }
      );
    });
  },
};

export { IncomeReportRepository };
export default IncomeReportRepository;
