// src/services/WalletsService.ts
import { getDatabase } from '../repositories/Database';
import { LedgerRepository } from '../repositories/LedgerRepository';
import WalletRepository from '../repositories/WalletRepository';
import Wallet from '../models/Wallet';

export interface CreateWalletRequest {
  name: string;
  openingBalance?: number;
}

export const WalletsService = {

  async createWallet(request: CreateWalletRequest): Promise<void> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {

      /* ---------------------------------------------
       * 1️⃣ Create Ledger (transaction-aware)
       * --------------------------------------------- */
      db.transaction(tx => {
        LedgerRepository.create(
          tx,
          {
            name: request.name,
            type: 'asset',
            isSystem: false,
          },
          async (ledgerId: number) => {
            try {
              /* ---------------------------------------------
               * 2️⃣ Create Wallet (repo handles its own tx)
               * --------------------------------------------- */
              const wallet = new Wallet(
                request.name,
                request.openingBalance ?? 0,
                undefined,
                ledgerId
              );

              await WalletRepository.add(wallet);
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          reject
        );
      });

    });
  }

};
