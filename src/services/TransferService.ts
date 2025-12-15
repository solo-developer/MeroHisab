import { getDatabase } from '../repositories/Database';
import { TransactionSummaryRepository } from '../repositories/TransactionSummaryRepository';
import { TransactionEntryRepository } from '../repositories/TransactionEntryRepository';
import { LedgerDailyBalanceRepository } from '../repositories/LedgerDailyBalanceRepository';
import { LedgerRepository } from '../repositories/LedgerRepository';

export interface TransferRequest {
  fromLedgerId?: number; // optional for external → wallet
  toLedgerId?: number;   // optional for wallet → external
  amount: number;
  date?: string;         // YYYY-MM-DD
  note?: string;
}
export const TransferService = {
  createTransfer: async (request: TransferRequest): Promise<void> => {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {

        const transactionDate =
          request.date || new Date().toISOString().split('T')[0];

        // 1️⃣ Get / create system External ledger
        LedgerRepository.ensureExternalLedger(
          tx,
          (externalLedgerId) => {

            const fromLedgerId =
              request.fromLedgerId == 0 ? externalLedgerId : request.fromLedgerId;

            const toLedgerId =
              request.toLedgerId== 0 ? externalLedgerId : request.toLedgerId;

            // 2️⃣ Create transaction summary
            TransactionSummaryRepository.create(
              tx,
              {
                type: 'transfer',
                date: transactionDate,
                note: request.note,
                amount : request.amount
              },
              (summaryId) => {

                // 3️⃣ Always double-entry
                const entries = [
                  {
                    ledgerId: fromLedgerId,
                    entryType: 'credit' as const,
                    amount: request.amount,
                  },
                  {
                    ledgerId: toLedgerId,
                    entryType: 'debit' as const,
                    amount: request.amount,
                  },
                ];

                const insertNext = (i: number) => {
                  if (i >= entries.length) {
                    resolve();
                    return;
                  }

                  const e = entries[i];

                  TransactionEntryRepository.create(
                    tx,
                    {
                      transactionSummaryId: summaryId,
                      ledgerId: e.ledgerId,
                      entryType: e.entryType,
                      amount: e.amount,
                    },
                    () => {
                      LedgerDailyBalanceRepository.updateBalance(
                        tx,
                        e.ledgerId,
                        transactionDate,
                        0,
                        0,
                        () => insertNext(i + 1),
                        reject
                      );
                    },
                    reject
                  );
                };

                insertNext(0);
              },
              reject
            );
          },
          reject
        );
      });
    });
  }
};
