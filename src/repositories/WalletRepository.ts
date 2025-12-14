import Wallet from '../models/Wallet';
import { getDatabase } from './Database';

export default class WalletRepository {

  static getAll(): Promise<Wallet[]> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `
          SELECT id, name, balance, ledgerId
          FROM wallets
          WHERE deletedAt IS NULL
          ORDER BY name;
          `,
          [],
          (_, res) => {
            const wallets: Wallet[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              const r = res.rows.item(i);
              wallets.push(
                new Wallet(r.name, r.balance, r.id, r.ledgerId)
              );
            }
            resolve(wallets);
          },
          (_, err) => reject(err),
        );
      });
    });
  }

  /**
   * Insert wallet (ledger must already exist)
   */
  static add(wallet: Wallet): Promise<void> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `
          INSERT INTO wallets (name, balance, ledgerId)
          VALUES (?, ?, ?);
          `,
          [wallet.name, wallet.balance, wallet.ledgerId],
          () => resolve(),
          (_, err) => reject(err),
        );
      });
    });
  }

  /**
   * Update wallet metadata only
   * (balance should eventually come from ledger)
   */
  static update(wallet: Wallet): Promise<void> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `
          UPDATE wallets
          SET name = ?
          WHERE id = ? AND deletedAt IS NULL;
          `,
          [wallet.name, wallet.id],
          () => resolve(),
          (_, err) => reject(err),
        );
      });
    });
  }

  /**
   * Soft delete wallet
   * (transactions are immutable)
   */
  static delete(id: number): Promise<void> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `
          UPDATE wallets
          SET deletedAt = CURRENT_TIMESTAMP
          WHERE id = ? AND deletedAt IS NULL;
          `,
          [id],
          () => resolve(),
          (_, err) => reject(err),
        );
      });
    });
  }
}
