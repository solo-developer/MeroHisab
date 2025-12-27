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
    const db = getDatabase();

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
        AND DATE(ts.date) BETWEEN DATE(?) AND DATE(?)
    `;
    const params: any[] = [fromDate, toDate];

    if (keyword) {
      sql += ` AND (ts.note LIKE ? OR c.name LIKE ? OR w.name LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }

    sql += ` GROUP BY ts.id ORDER BY ts.date DESC`;

    db.transaction((tx: any) => {
      tx.executeSql(
        sql,
        params,
        (_: any, result: any) => {
          const rows: ExpenseReportRow[] = [];
          let total = 0;

          for (let i = 0; i < result.rows.length; i++) {
            const row = result.rows.item(i);
            rows.push(row);
            total += row.amount;
          }

          callback(rows, total);
        },
        (_: any, error: any) => {
          console.error('ExpenseReport query failed', error);
          return false;
        },
      );
    });
  }
}
