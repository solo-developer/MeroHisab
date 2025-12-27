// src/repositories/TransferReportRepository.ts
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
   * @param fromDate 'YYYY-MM-DD'
   * @param toDate 'YYYY-MM-DD'
   * @param callback returns TransferReportRow[]
   */
  getTransferReport: (
    fromDate?: string,
    toDate?: string,
    keyword?: string,
    callback?: (rows: TransferReportRow[]) => void
  ) => {
    const db = getDatabase();

    let query = `
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
      query += ` AND date(ts.date) >= date(?)`;
      params.push(fromDate);
    }

    if (toDate) {
      query += ` AND date(ts.date) <= date(?)`;
      params.push(toDate);
    }

    if (keyword) {
        query += ` AND (ts.note LIKE ? OR wFrom.name LIKE ? OR wTo.name LIKE ?)`;
        params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    query += ` ORDER BY ts.date DESC, ts.id DESC`;

    db.transaction((tx: any) => {
      tx.executeSql(
        query,
        params,
        (_: any, results: any) => {
          const rows: TransferReportRow[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            rows.push(results.rows.item(i));
          }
          callback && callback(rows);
        },
        (_: any, error: any) => {
          console.error('TransferReportRepository.getTransferReport error:', error);
          return false;
        }
      );
    });
  },
};

export { TransferReportRepository };
export default TransferReportRepository;
