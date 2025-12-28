import Wallet from '../models/Wallet';
import { getDatabase } from './Database';

export interface WalletBalanceRow {
  walletId: number;
  walletName: string;
  ledgerId: number;
  balance: number;
}

export default class WalletRepository {

  static getAll(): Promise<Wallet[]> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
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
          (_: any, err: any) => reject(err),
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
      db.transaction((tx: any) => {
        tx.executeSql(
          `
          INSERT INTO wallets (name, balance, ledgerId)
          VALUES (?, ?, ?);
          `,
          [wallet.name, wallet.balance, wallet.ledgerId],
          () => resolve(),
          (_: any, err: any) => reject(err),
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
      db.transaction((tx: any) => {
        tx.executeSql(
          `
          UPDATE wallets
          SET name = ?
          WHERE id = ? AND deletedAt IS NULL;
          `,
          [wallet.name, wallet.id],
          () => resolve(),
          (_: any, err: any) => reject(err),
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
      db.transaction((tx: any) => {
        tx.executeSql(
          `
          UPDATE wallets
          SET deletedAt = CURRENT_TIMESTAMP
          WHERE id = ? AND deletedAt IS NULL;
          `,
          [id],
          () => resolve(),
          (_: any, err: any) => reject(err),
        );
      });
    });
  }

  /**
   * Returns wallet list with computed balance from ledger entries
   */
  static getWalletBalances(
    callback: (rows: WalletBalanceRow[]) => void,
    errorCallback?: (error: any) => void
  ) {
    const db = getDatabase();

    /**
     * Optimization: instead of re-calculating everything from TransactionEntry 
     * which might miss initial/manual snapshots, we use the 'balance' column 
     * which is maintained as a live snapshot in the wallets table.
     */
    const query = `
      SELECT
        w.id            AS walletId,
        w.name          AS walletName,
        w.ledgerId      AS ledgerId,
        COALESCE(w.balance, 0) AS balance
      FROM wallets w
      WHERE w.deletedAt IS NULL
      ORDER BY w.name ASC
    `;

    db.transaction((tx: any) => {
      tx.executeSql(
        query,
        [],
        (_: any, result: any) => {
          const rows: WalletBalanceRow[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
          }
          callback(rows);
        },
        (_: any, error: any) => {
          errorCallback?.(error);
          return false;
        }
      );
    });
  }
  static getTotalCurrentBalance(): Promise<number> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          'SELECT SUM(balance) as total FROM wallets WHERE deletedAt IS NULL;',
          [],
          (_: any, res: any) => resolve(res.rows.item(0).total || 0),
          (_: any, err: any) => reject(err)
        );
      });
    });
  }
}
