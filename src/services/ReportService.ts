// src/services/ReportService.ts
import { getRangeDates, ReportRange } from '../helpers/DateHelper';
import {
  IncomeExpenseReport,
  TransactionSummaryRepository,
} from '../repositories/TransactionSummaryRepository';
import { getDatabase } from '../repositories/Database';

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

    return TransactionSummaryRepository.getIncomeExpense(
      startDate.toISOString(),
      endDate.toISOString(),
    );
  }

  static async getPayments(
    startDate: Date,
    endDate: Date,
  ): Promise<PaymentReceiptRecord[]> {
    const db = getDatabase();

    return new Promise<PaymentReceiptRecord[]>((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT ts.id, p.name as partyName, ts.amount, ts.date, ts.note
           FROM TransactionSummary ts
           JOIN TransactionEntry te ON te.transactionSummaryId = ts.id
           JOIN Parties p ON p.ledgerId = te.ledgerId
           WHERE ts.type = 'payment'
           AND ts.date BETWEEN ? AND ?
           ORDER BY ts.date DESC`,
          [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
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

  static async getReceipts(
    startDate: Date,
    endDate: Date,
  ): Promise<PaymentReceiptRecord[]> {
    const db = getDatabase();

    return new Promise<PaymentReceiptRecord[]>((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT ts.id, p.name as partyName, ts.amount, ts.date, ts.note
           FROM TransactionSummary ts
           JOIN TransactionEntry te ON te.transactionSummaryId = ts.id
           JOIN Parties p ON p.ledgerId = te.ledgerId
           WHERE ts.type = 'receipt'
           AND ts.date BETWEEN ? AND ?
           ORDER BY ts.date DESC`,
          [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]],
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
}
