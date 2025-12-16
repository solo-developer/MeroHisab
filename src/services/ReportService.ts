// src/services/ReportService.ts
import { TransactionEntryRepository, TransactionEntryRow } from "../repositories/TransactionEntryRepository";

export type ReportRange = "this_week" | "this_month" | "previous_month";

export interface IncomeExpenseReport {
  income: number;
  expense: number;
}

export class ReportService {
  static async getIncomeExpense(range: ReportRange): Promise<IncomeExpenseReport> {
    const { startDate, endDate } = ReportService.getRangeDates(range);

    const entries = await new Promise<TransactionEntryRow[]>((resolve, reject) => {
      TransactionEntryRepository.getEntriesBetweenDates(
        startDate.toISOString(),
        endDate.toISOString(),
        resolve,
        reject
      );
    });

    let income = 0;
    let expense = 0;
    entries.filter(a=>a.type == 'income' || a.type == 'expense').forEach(entry => {
      if (entry.entryType === 'debit') {
        income += entry.amount;
      } else if (entry.entryType === 'credit') {
        expense += entry.amount;
      }
    });

    return { income, expense };
  }

  private static getRangeDates(range: ReportRange): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();

    switch (range) {
      case "this_week":
        const day = now.getDay();
        startDate.setDate(now.getDate() - day); // start of week (Sunday)
        endDate = now;
        break;
      case "this_month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case "previous_month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
    }
    return { startDate, endDate };
  }
}
