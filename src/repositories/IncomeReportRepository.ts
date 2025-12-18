import { getDatabase } from './Database';

export interface IncomeReportRow {
  id: number;
  date: string;
  amount: number;
  note: string | null;
  categoryName: string | null;
   walletName: string | null;
}

export class IncomeReportRepository {
  /**
   * Fetch all income transactions
   */
  static getIncomeReport(
    callback: (rows: IncomeReportRow[]) => void,
    errorCallback?: (error: any) => void
  ) {
    const db = getDatabase();

   const query = `
      SELECT 
        ts.id,
        ts.date,
        ts.amount,
        ts.note,
        c.name AS categoryName,
        w.name AS walletName
      FROM TransactionSummary ts
      LEFT JOIN categories c ON ts.categoryId = c.id
      LEFT JOIN TransactionEntry te ON te.transactionSummaryId = ts.id
      LEFT JOIN wallets w ON te.ledgerId = w.ledgerId
      WHERE ts.type = 'income'
      AND ts.deletedAt IS NULL
      GROUP BY ts.id
      ORDER BY ts.date DESC
    `;

    db.transaction(tx => {
      tx.executeSql(
        query,
        [],
        (_, result) => {
          const rows: IncomeReportRow[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
          }
          callback(rows);
        },
        (_, error) => {
          if (errorCallback) errorCallback?.(error);
          return false;
        }
      );
    });
  }
}
