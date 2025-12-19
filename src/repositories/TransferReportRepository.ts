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

    const params: (string | undefined)[] = [];

    if (fromDate) {
      query += ` AND date(ts.date) >= date(?)`;
      params.push(fromDate);
    }

    if (toDate) {
      query += ` AND date(ts.date) <= date(?)`;
      params.push(toDate);
    }

    query += ` ORDER BY ts.date DESC, ts.id DESC`;

    db.transaction(tx => {
      tx.executeSql(
        query,
        params,
        (_, results) => {
          const rows: TransferReportRow[] = [];
          for (let i = 0; i < results.rows.length; i++) {
            rows.push(results.rows.item(i));
          }
          callback && callback(rows);
        },
        (_, error) => {
          console.error('TransferReportRepository.getTransferReport error:', error);
          return false;
        }
      );
    });
  },
};

export { TransferReportRepository };
export default TransferReportRepository;
