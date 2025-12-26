// src/services/WalletsService.ts
import { getDatabase } from '../repositories/Database';
import { LedgerRepository } from '../repositories/LedgerRepository';
import { TransactionSummaryRepository } from '../repositories/TransactionSummaryRepository';
import { TransactionEntryRepository } from '../repositories/TransactionEntryRepository';
import Wallet from '../models/Wallet';

export interface CreateWalletRequest {
  name: string;
  openingBalance?: number;
}

export const WalletsService = {

  async createWallet(request: CreateWalletRequest): Promise<void> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        LedgerRepository.create(
          tx,
          {
            name: request.name,
            type: 'asset',
            isSystem: false,
          },
          (ledgerId: number) => {
            // 2️⃣ Create Wallet record
            const openingBal = request.openingBalance ?? 0;
            
            tx.executeSql(
              `INSERT INTO wallets (name, balance, ledgerId) VALUES (?, ?, ?)`,
              [request.name, openingBal, ledgerId],
              (_: any, res: any) => {
                // 3️⃣ If there's an opening balance, record it in ledger as a transaction
                // This ensures the ledger calculation matches the snapshot
                if (openingBal !== 0) {
                  TransactionSummaryRepository.create(
                    tx,
                    {
                      type: 'adjustment',
                      date: new Date().toISOString(),
                      note: 'Opening Balance',
                      amount: openingBal,
                    },
                    (summaryId: number) => {
                      TransactionEntryRepository.create(
                        tx,
                        {
                          transactionSummaryId: summaryId,
                          ledgerId: ledgerId,
                          entryType: openingBal > 0 ? 'debit' : 'credit',
                          amount: Math.abs(openingBal),
                        },
                        () => resolve(),
                        (err) => reject(err)
                      );
                    },
                    (err) => reject(err)
                  );
                } else {
                  resolve();
                }
              },
              (_: any, err: any) => { reject(err); return false; }
            );
          },
          reject
        );
      });
    });
  }

};
