import { getRangeDates, ReportRange, toSQLDate } from '../helpers/DateHelper';
import {
  IncomeExpenseReport,
  TransactionSummaryRepository,
} from '../repositories/TransactionSummaryRepository';
import { getDatabase } from '../repositories/Database';

export interface TrendDataPoint {
  date: string;
  income: number;
  expense: number;
}

export interface PaymentReceiptRecord {
  id: number;
  partyName: string;
  amount: number;
  date: string;
  note?: string;
}

export class ReportService {
  static async getIncomeExpense(
    range: ReportRange,
  ): Promise<IncomeExpenseReport> {
    const { startDate, endDate } = getRangeDates(range);

    // Using date() function in SQL for robust comparison
    return TransactionSummaryRepository.getIncomeExpense({
      fromDate: toSQLDate(startDate)!,
      toDate: toSQLDate(endDate)!,
    });
  }

  static async getPayments(
    startDate: Date,
    endDate: Date,
    keyword?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<PaymentReceiptRecord[]> {
    const db = getDatabase();

    return new Promise<PaymentReceiptRecord[]>((resolve, reject) => {
      db.transaction((tx: any) => {
        let query = `SELECT ts.id, p.name as partyName, ts.amount, ts.date, ts.note
           FROM TransactionSummary ts
           JOIN TransactionEntry te ON te.transactionSummaryId = ts.id
           JOIN Parties p ON p.ledgerId = te.ledgerId
           WHERE ts.type = 'payment' AND ts.deletedAt IS NULL
           AND date(ts.date) BETWEEN ? AND ?`;
        
        const params: any[] = [toSQLDate(startDate), toSQLDate(endDate)];
        
        if (keyword) {
          query += ` AND (p.name LIKE ? OR ts.note LIKE ?)`;
          params.push(`%${keyword}%`, `%${keyword}%`);
        }

        query += ` ORDER BY ts.date DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        tx.executeSql(
          query,
          params,
          (_: any, results: any) => {
            const data: PaymentReceiptRecord[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              data.push(results.rows.item(i));
            }
            resolve(data);
          },
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  static async getPaymentsTotal(
    startDate: Date,
    endDate: Date,
    keyword?: string,
  ): Promise<number> {
    const db = getDatabase();

    return new Promise<number>((resolve, reject) => {
      db.transaction((tx: any) => {
        let query = `SELECT SUM(ts.amount) as total
           FROM TransactionSummary ts
           JOIN TransactionEntry te ON te.transactionSummaryId = ts.id
           JOIN Parties p ON p.ledgerId = te.ledgerId
           WHERE ts.type = 'payment' AND ts.deletedAt IS NULL
           AND date(ts.date) BETWEEN ? AND ?`;
        
        const params: any[] = [toSQLDate(startDate), toSQLDate(endDate)];
        
        if (keyword) {
          query += ` AND (p.name LIKE ? OR ts.note LIKE ?)`;
          params.push(`%${keyword}%`, `%${keyword}%`);
        }

        tx.executeSql(
          query,
          params,
          (_: any, results: any) => {
            resolve(results.rows.item(0).total || 0);
          },
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  static async getReceipts(
    startDate: Date,
    endDate: Date,
    keyword?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<PaymentReceiptRecord[]> {
    const db = getDatabase();

    return new Promise<PaymentReceiptRecord[]>((resolve, reject) => {
      db.transaction((tx: any) => {
        let query = `SELECT ts.id, p.name as partyName, ts.amount, ts.date, ts.note
           FROM TransactionSummary ts
           JOIN TransactionEntry te ON te.transactionSummaryId = ts.id
           JOIN Parties p ON p.ledgerId = te.ledgerId
           WHERE ts.type = 'receipt' AND ts.deletedAt IS NULL
           AND date(ts.date) BETWEEN ? AND ?`;
        
        const params: any[] = [toSQLDate(startDate), toSQLDate(endDate)];

        if (keyword) {
          query += ` AND (p.name LIKE ? OR ts.note LIKE ?)`;
          params.push(`%${keyword}%`, `%${keyword}%`);
        }

        query += ` ORDER BY ts.date DESC LIMIT ? OFFSET ?`;
        params.push(limit, offset);

        tx.executeSql(
          query,
          params,
          (_: any, results: any) => {
            const data: PaymentReceiptRecord[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              data.push(results.rows.item(i));
            }
            resolve(data);
          },
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  static async getReceiptsTotal(
    startDate: Date,
    endDate: Date,
    keyword?: string,
  ): Promise<number> {
    const db = getDatabase();

    return new Promise<number>((resolve, reject) => {
      db.transaction((tx: any) => {
        let query = `SELECT SUM(ts.amount) as total
           FROM TransactionSummary ts
           JOIN TransactionEntry te ON te.transactionSummaryId = ts.id
           JOIN Parties p ON p.ledgerId = te.ledgerId
           WHERE ts.type = 'receipt' AND ts.deletedAt IS NULL
           AND date(ts.date) BETWEEN ? AND ?`;
        
        const params: any[] = [toSQLDate(startDate), toSQLDate(endDate)];

        if (keyword) {
          query += ` AND (p.name LIKE ? OR ts.note LIKE ?)`;
          params.push(`%${keyword}%`, `%${keyword}%`);
        }

        tx.executeSql(
          query,
          params,
          (_: any, results: any) => {
            resolve(results.rows.item(0).total || 0);
          },
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  static async getTrendData(
    startDate: Date,
    endDate: Date,
  ): Promise<TrendDataPoint[]> {
    const db = getDatabase();

    return new Promise<TrendDataPoint[]>((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT 
            date(date) as date,
            SUM(CASE WHEN type IN ('income', 'receipt') THEN amount ELSE 0 END) as income,
            SUM(CASE WHEN type IN ('expense', 'payment') THEN amount ELSE 0 END) as expense
           FROM TransactionSummary
           WHERE deletedAt IS NULL
           AND date(date) BETWEEN ? AND ?
           GROUP BY date(date)
           ORDER BY date(date) ASC`,
          [toSQLDate(startDate), toSQLDate(endDate)],
          (_: any, results: any) => {
            const data: TrendDataPoint[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              const r = results.rows.item(i);
              data.push({
                date: r.date,
                income: r.income || 0,
                expense: r.expense || 0,
              });
            }
            resolve(data);
          },
          (_: any, err: any) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }
}
