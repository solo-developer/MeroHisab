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
  walletId: number;          // WALLET ID
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

    return new Promise<void>((resolve, reject) => {
      db.transaction((tx: any) => {
        const netAmount = this.calculateNetAmount(
          request.grossAmount,
          request.discount,
          request.amount
        );

        if (netAmount <= 0) {
          reject(new Error("Income amount must be greater than zero"));
          return;
        }

        if (!request.categoryId) {
          reject(new Error("Income category is required"));
          return;
        }

        // 1. Get Wallet info
        tx.executeSql(
          `SELECT id, balance, ledgerId FROM wallets WHERE id = ?`,
          [request.walletId],
          (_: any, walletRes: any) => {
            if (walletRes.rows.length === 0) {
              reject(new Error("Wallet not found"));
              return;
            }
            const wallet = walletRes.rows.item(0);
            const walletLedgerId = wallet.ledgerId;
            const currentWalletBalance = wallet.balance;

            // 2. Resolve category → ledger
            CategoryRepository.getById(
              tx,
              request.categoryId!,
              category => {
                if (!category || !category.ledgerId) {
                  reject(new Error("Income category ledger not found"));
                  return;
                }

                const incomeLedgerId = category.ledgerId;

                // 3. Create Transaction Summary
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

                    // 4. CREDIT income ledger (Increase Income)
                    TransactionEntryRepository.create(
                      tx,
                      {
                        transactionSummaryId: summaryId,
                        ledgerId: incomeLedgerId,
                        entryType: "credit",
                        amount: netAmount,
                      },
                      () => {},
                      err => reject(new Error("Failed to add income ledger entry: " + err.message))
                    );

                    // 5. DEBIT wallet ledger (Increase Asset)
                    TransactionEntryRepository.create(
                      tx,
                      {
                        transactionSummaryId: summaryId,
                        ledgerId: walletLedgerId,
                        entryType: "debit",
                        amount: netAmount,
                      },
                      () => {},
                      err => reject(new Error("Failed to add wallet entry: " + err.message))
                    );

                    // 6. DEBIT discount given (if any)
                    // Note: Discount Given is an Expense (Debit)
                    if (request.discount && request.discount > 0) {
                      LedgerRepository.getLedgerByCode(
                        tx,
                        "DISCOUNT_GIVEN",
                        discountLedger => {
                          if (discountLedger) {
                            TransactionEntryRepository.create(
                              tx,
                              {
                                transactionSummaryId: summaryId,
                                ledgerId: discountLedger.id,
                                entryType: "debit",
                                amount: request.discount,
                              },
                              () => {},
                              err => reject(new Error("Failed to add discount entry: " + err.message))
                            );
                          }
                        }
                      );
                    }

                    // 7. Update Wallet Balance
                    const newWalletBalance = currentWalletBalance + netAmount;
                      tx.executeSql(
                        `UPDATE wallets SET balance = ? WHERE id = ?`,
                        [newWalletBalance, wallet.id],
                        () => resolve(),
                        (_: any, err: any) => {
                          reject(err);
                          return false;
                        }
                      );
                  },
                  err => reject(new Error("Failed to create transaction summary: " + err.message))
                );
              },
              err => reject(new Error("Failed to load income category: " + err.message))
            );
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }
}
