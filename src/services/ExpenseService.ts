import { getDatabase } from "../repositories/Database";
import { LedgerRepository } from "../repositories/LedgerRepository";
import { TransactionEntryRepository } from "../repositories/TransactionEntryRepository";
import {
  TransactionSummaryCreate,
  TransactionSummaryRepository,
} from "../repositories/TransactionSummaryRepository";
import CategoryRepository from "../repositories/CategoryRepository";

export interface AddExpenseRequest {
  amount: number;           // net paid
  grossAmount: number;
  discount: number;
  categoryId?: number;      // CATEGORY (maps to ledger)
  walletId: number;         // WALLET LEDGER
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

      if (!request.categoryId)
        throw new Error("Expense category is required");

      // 1️⃣ Resolve category → ledger
      CategoryRepository.getById(
        tx,
        request.categoryId,
        category => {
          if (!category || !category.ledgerId)
            throw new Error("Expense category ledger not found");

          const expenseLedgerId = category.ledgerId;

          // 2️⃣ Create Transaction Summary
          TransactionSummaryRepository.create(
            tx,
            {
              type: "expense",
              note: request.note || "",
              date: request.date,
              amount: netAmount,
              categoryId: request.categoryId,
            } as TransactionSummaryCreate,
            (summaryId: number) => {

              // 3️⃣ CREDIT expense ledger
              TransactionEntryRepository.create(
                tx,
                {
                  transactionSummaryId: summaryId,
                  ledgerId: expenseLedgerId,
                  entryType: "credit",
                  amount: request.grossAmount,
                },
                () => {},
                err => {
                  throw new Error(
                    "Failed to add expense ledger entry: " + err.message
                  );
                }
              );

              // 4️⃣ DEBIT wallet ledger
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
                    "Failed to add wallet entry: " + err.message
                  );
                }
              );

              // 5️⃣ DEBIT discount received (if any)
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
                          "Failed to add discount entry: " + err.message
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
        },
        err => {
          throw new Error("Failed to load expense category: " + err.message);
        }
      );
    });
  }
}
