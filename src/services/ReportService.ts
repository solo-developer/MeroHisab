// src/services/ReportService.ts
import { getRangeDates, ReportRange } from '../helpers/DateHelper';
import {
  IncomeExpenseReport,
  TransactionSummaryRepository,
} from '../repositories/TransactionSummaryRepository';

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
}
