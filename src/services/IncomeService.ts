import { getDatabase } from "../repositories/Database";
import { LedgerRepository } from "../repositories/LedgerRepository";
import { TransactionEntryRepository } from "../repositories/TransactionEntryRepository";
import {
  TransactionSummaryCreate,
  TransactionSummaryRepository,
} from "../repositories/TransactionSummaryRepository";
import CategoryRepository from "../repositories/CategoryRepository";

export interface AddIncomeRequest {
  amount: number;            // net received
  grossAmount?: number;
  discount: number;
  categoryId?: number;       // CATEGORY (maps to ledger)
  walletId: number;          // WALLET LEDGER
  date: string;
  note?: string;
}

export class IncomeService {
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

  static async addIncome(request: AddIncomeRequest) {
    const db = getDatabase();

    db.transaction(tx => {
      const netAmount = this.calculateNetAmount(
        request.grossAmount,
        request.discount,
        request.amount
      );

      if (netAmount <= 0)
        throw new Error("Income amount must be greater than zero");

      if (!request.categoryId)
        throw new Error("Income category is required");

      // 1️⃣ Resolve category → ledger
      CategoryRepository.getById(
        tx,
        request.categoryId,
        category => {
          if (!category || !category.ledgerId)
            throw new Error("Income category ledger not found");

          const incomeLedgerId = category.ledgerId;

          // 2️⃣ Create Transaction Summary
          TransactionSummaryRepository.create(
            tx,
            {
              type: "income",
              note: request.note || "",
              date: request.date,
              amount: netAmount,
              categoryId: request.categoryId,
            } as TransactionSummaryCreate,
            (summaryId: number) => {

              // 3️⃣ CREDIT income ledger
              TransactionEntryRepository.create(
                tx,
                {
                  transactionSummaryId: summaryId,
                  ledgerId: incomeLedgerId,
                  entryType: "credit",
                  amount: netAmount,
                },
                () => {},
                err => {
                  throw new Error(
                    "Failed to add income ledger entry: " + err.message
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

              // 5️⃣ DEBIT discount given (if any)
              if (request.discount && request.discount > 0) {
                LedgerRepository.getLedgerByCode(
                  tx,
                  "DISCOUNT_GIVEN",
                  discountLedger => {
                    if (!discountLedger)
                      throw new Error("Discount Given ledger not found");

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
          throw new Error("Failed to load income category: " + err.message);
        }
      );
    });
  }
}
