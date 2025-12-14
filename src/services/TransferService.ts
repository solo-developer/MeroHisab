import { getDatabase } from '../repositories/Database';
import { TransactionSummaryRepository } from '../repositories/TransactionSummaryRepository';
import { TransactionEntryRepository } from '../repositories/TransactionEntryRepository';
import { LedgerDailyBalanceRepository } from '../repositories/LedgerDailyBalanceRepository';

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
        const transferType =
          request.fromLedgerId && request.toLedgerId
            ? 'internal'
            : request.fromLedgerId
            ? 'wallet-to-external'
            : 'external-to-wallet';

        const transactionDate = request.date || new Date().toISOString().split('T')[0];

        // 1️⃣ Create TransactionSummary
        TransactionSummaryRepository.create(
          tx,
          { type: 'transfer', note: request.note, date: transactionDate },
          (summaryId: number) => {

            const entries: { ledgerId: number; entryType: 'debit' | 'credit'; amount: number }[] = [];

            if (transferType === 'internal') {
              entries.push({ ledgerId: request.fromLedgerId!, entryType: 'credit', amount: request.amount });
              entries.push({ ledgerId: request.toLedgerId!, entryType: 'debit', amount: request.amount });
            } else if (transferType === 'wallet-to-external') {
              entries.push({ ledgerId: request.fromLedgerId!, entryType: 'credit', amount: request.amount });
            } else if (transferType === 'external-to-wallet') {
              entries.push({ ledgerId: request.toLedgerId!, entryType: 'debit', amount: request.amount });
            }

            const insertNext = (index: number) => {
              if (index >= entries.length) {
                resolve(); // all entries inserted
                return;
              }

              const e = entries[index];
              TransactionEntryRepository.create(
                tx,
                {
                  transactionSummaryId: summaryId,
                  ledgerId: e.ledgerId,
                  entryType: e.entryType,
                  amount: e.amount
                },
                () => {
                  // Update daily balance after each entry
                  LedgerDailyBalanceRepository.updateBalance(
                    tx,
                    e.ledgerId,
                    transactionDate,
                    0, // openingBalance can be recalculated later if needed
                    0, // closingBalance can be recalculated later
                    () => insertNext(index + 1),
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

      });
    });
  }
};
