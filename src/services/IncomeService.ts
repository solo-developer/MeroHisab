import { getDatabase } from "../repositories/Database";
import { LedgerRepository } from "../repositories/LedgerRepository";
import { TransactionEntryRepository } from "../repositories/TransactionEntryRepository";
import { TransactionSummaryCreate, TransactionSummaryRepository } from "../repositories/TransactionSummaryRepository";

export interface AddIncomeRequest {
  amount: number;            // net received or gross-discount
  grossAmount?: number;
  discount: number;
  categoryId? :number;
  walletId: number;
  date: string;
  note?: string;
}

export class IncomeService {
  private static calculateNetAmount(gross?: number, discount?: number, amount?: number): number {
    if (gross !== undefined && discount !== undefined) {
      return gross - discount;
    }
    return amount || 0;
  }

  static async addIncome(request: AddIncomeRequest) {
    const db = getDatabase();

    db.transaction(tx => {
      const netAmount = this.calculateNetAmount(request.grossAmount, request.discount, request.amount);

      if (netAmount <= 0) throw new Error('Income amount must be greater than zero');

      // 1️⃣ Create Transaction Summary
      TransactionSummaryRepository.create(
        tx,
        { type: 'income', note: request.note || '', date: request.date,amount : request.amount } as TransactionSummaryCreate,
        (summaryId: number) => {
          // 2️⃣ Add main income transaction
          TransactionEntryRepository.create(
            tx,
            {
              transactionSummaryId: summaryId,
              ledgerId: request.walletId,
              entryType: 'credit',
              amount: netAmount,
            },
            () => {},
            err => { throw new Error('Failed to add main income transaction: ' + err.message); }
          );

          if (request.discount && request.discount > 0) {
            LedgerRepository.getLedgerByCode(tx, 'DISCOUNT_GIVEN', discountLedger => {
              if (!discountLedger) throw new Error('Discount Given ledger not found');

              TransactionEntryRepository.create(
                tx,
                {
                  transactionSummaryId: summaryId,
                  ledgerId: discountLedger.id,
                  entryType: 'credit',
                  amount: request.discount,
                },
                () => {},
                err => { throw new Error('Failed to add discount transaction: ' + err.message); }
              );

            });
          }
        },
        err => {
          throw new Error('Failed to create transaction summary: ' + err.message);
        }
      );
    });
  }
}
