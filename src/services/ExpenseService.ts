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
  walletId: number;         // WALLET ID (from wallets table)
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

    return new Promise<void>((resolve, reject) => {
      db.transaction((tx: any) => {
        const netAmount = this.calculateNetAmount(
          request.grossAmount,
          request.discount,
          request.amount
        );

        if (netAmount <= 0) {
          reject(new Error("Expense amount must be greater than zero"));
          return;
        }

        if (!request.categoryId) {
          reject(new Error("Expense category is required"));
          return;
        }

        // 1. Get Wallet info (balance and ledgerId)
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
                  reject(new Error("Expense category ledger not found"));
                  return;
                }

                const expenseLedgerId = category.ledgerId;

                // 3. Create Transaction Summary
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

                    // 4. DEBIT expense ledger (Increase Expense)
                    TransactionEntryRepository.create(
                      tx,
                      {
                        transactionSummaryId: summaryId,
                        ledgerId: expenseLedgerId,
                        entryType: "debit",
                        amount: request.grossAmount,
                      },
                      () => {},
                      err => reject(new Error("Failed to add expense ledger entry: " + err.message))
                    );

                    // 5. CREDIT wallet ledger (Decrease Asset)
                    TransactionEntryRepository.create(
                      tx,
                      {
                        transactionSummaryId: summaryId,
                        ledgerId: walletLedgerId,
                        entryType: "credit",
                        amount: netAmount,
                      },
                      () => {},
                      err => reject(new Error("Failed to add wallet entry: " + err.message))
                    );

                    // 6. CREDIT discount received (if any)
                    // Note: In standard accounting, Discount Received is an Income (Credit)
                    if (request.discount && request.discount > 0) {
                      LedgerRepository.getLedgerByCode(
                        tx,
                        "DISCOUNT_RECEIVED",
                        discountLedger => {
                          if (discountLedger) {
                            TransactionEntryRepository.create(
                              tx,
                              {
                                transactionSummaryId: summaryId,
                                ledgerId: discountLedger.id,
                                entryType: "credit",
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
                    const newWalletBalance = currentWalletBalance - netAmount;
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
              err => reject(new Error("Failed to load expense category: " + err.message))
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
