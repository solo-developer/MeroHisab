import { RecurringTransactionRepository, RecurringTransaction } from '../repositories/RecurringTransactionRepository';
import { ExpenseService } from './ExpenseService';
import { IncomeService } from './IncomeService';
import { toSQLDate } from '../helpers/DateHelper';

export class RecurringTransactionService {

    static async processPending() {
        const today = new Date();
        const todayStr = toSQLDate(today)!;

        const pending = await RecurringTransactionRepository.getPending(todayStr);

        for (const item of pending) {
            await this.processItem(item);
        }
    }

    private static async processItem(item: RecurringTransaction) {
        let currentProcessDate = new Date(item.nextRunDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Process all occurrences from nextRunDate up to today
        while (currentProcessDate <= today) {
            const dateStr = toSQLDate(currentProcessDate)!;

            try {
                if (item.type === 'expense') {
                    await ExpenseService.addExpense({
                        amount: item.amount,
                        grossAmount: item.amount,
                        discount: 0,
                        categoryId: item.categoryId,
                        walletId: item.walletId,
                        date: dateStr,
                        note: `(Recurring) ${item.note || ''}`,
                    });
                } else {
                    await IncomeService.addIncome({
                        amount: item.amount,
                        grossAmount: item.amount,
                        discount: 0,
                        categoryId: item.categoryId,
                        walletId: item.walletId,
                        date: dateStr,
                        note: `(Recurring) ${item.note || ''}`,
                    });
                }

                // Calculate next run date
                const nextDate = this.calculateNextDate(currentProcessDate, item.frequency);
                await RecurringTransactionRepository.updateLastProcessed(item.id, dateStr, toSQLDate(nextDate)!);

                currentProcessDate = nextDate;
            } catch (error) {
                console.error(`Failed to process recurring transaction ${item.id}:`, error);
                break; // Stop processing this item if it fails
            }
        }
    }

    static calculateNextDate(currentDate: Date, frequency: string): Date {
        const next = new Date(currentDate);
        if (frequency === 'daily') {
            next.setDate(next.getDate() + 1);
        } else if (frequency === 'weekly') {
            next.setDate(next.getDate() + 7);
        } else if (frequency === 'monthly') {
            // Move to next month
            const currentDay = next.getDate();
            next.setMonth(next.getMonth() + 1);
            // Handle month overflow (e.g., Jan 31 -> Feb 28/29)
            if (next.getDate() < currentDay) {
                next.setDate(0);
            }
        } else if (frequency === 'yearly') {
            next.setFullYear(next.getFullYear() + 1);
        }
        return next;
    }

    static async addRecurring(data: any) {
        // Calculate initial nextRunDate based on startDate and frequency
        // For simplicity, we can assume the user picks a startDate that is the first occurrence.
        const nextRunDate = data.startDate;

        return await RecurringTransactionRepository.create({
            ...data,
            nextRunDate
        });
    }

    static async list() {
        return await RecurringTransactionRepository.getAll();
    }

    static async delete(id: number) {
        return await RecurringTransactionRepository.delete(id);
    }

    static async toggle(id: number, isActive: boolean) {
        return await RecurringTransactionRepository.toggleStatus(id, isActive ? 1 : 0);
    }
}
