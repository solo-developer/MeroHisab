import { getDatabase } from "../repositories/Database";
import { LedgerRepository } from "../repositories/LedgerRepository";
import { TransactionEntryRepository } from "../repositories/TransactionEntryRepository";
import {
  TransactionSummaryCreate,
  TransactionSummaryRepository,
} from "../repositories/TransactionSummaryRepository";

export interface AddExpenseRequest {
  amount: number;           // net paid (gross - discount)
  grossAmount: number;
  discount: number;
  categoryId?: number;
  walletId: number;
  date: string;
  note?: string;
}

export class ExpenseService {
  private static calculateNetAmount(
    gross?: number,
    discount?: number,
    amount?: number
  ): number {
    if (gross !== undefined && discount !== undefined) {
      return gross - discount;
    }
    return amount || 0;
  }

  static async addExpense(request: AddExpenseRequest) {
    const db = getDatabase();

    db.transaction(tx => {
      const netAmount = this.calculateNetAmount(
        request.grossAmount,
        request.discount,
        request.amount
      );

      if (netAmount <= 0)
        throw new Error("Expense amount must be greater than zero");

      // 1️⃣ Create Transaction Summary
      TransactionSummaryRepository.create(
        tx,
        {
          type: "expense",
          note: request.note || "",
          date: request.date,
          amount: request.amount,
          categoryId : request.categoryId // store net amount
        } as TransactionSummaryCreate,
        (summaryId: number) => {

          // 2️⃣ Main expense entry (Wallet DEBIT)
          TransactionEntryRepository.create(
            tx,
            {
              transactionSummaryId: summaryId,
              ledgerId: request.walletId,
              entryType: "debit",
              amount: netAmount,
            },
            () => {},
            err => {
              throw new Error(
                "Failed to add main expense transaction: " + err.message
              );
            }
          );

          // 3️⃣ Discount received (if any)
          if (request.discount && request.discount > 0) {
            LedgerRepository.getLedgerByCode(
              tx,
              "DISCOUNT_RECEIVED",
              discountLedger => {
                if (!discountLedger)
                  throw new Error("Discount Received ledger not found");

                TransactionEntryRepository.create(
                  tx,
                  {
                    transactionSummaryId: summaryId,
                    ledgerId: discountLedger.id,
                    entryType: "debit",
                    amount: request.discount,
                  },
                  () => {},
                  err => {
                    throw new Error(
                      "Failed to add discount transaction: " + err.message
                    );
                  }
                );
              }
            );
          }
        },
        err => {
          throw new Error(
            "Failed to create transaction summary: " + err.message
          );
        }
      );
    });
  }
}
