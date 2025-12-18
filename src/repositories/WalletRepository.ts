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

  /**
   * Returns wallet list with computed balance from ledger entries
   */
  static getWalletBalances(
    callback: (rows: WalletBalanceRow[]) => void,
    errorCallback?: (error: any) => void
  ) {
    const db = getDatabase();

    /**
     * Balance logic:
     * - Debit  => +amount (asset increase)
     * - Credit => -amount (asset decrease)
     *
     * Wallets are assets → normal balance = debit
     */
    const query = `
      SELECT
        w.id            AS walletId,
        w.name          AS walletName,
        w.ledgerId      AS ledgerId,
        COALESCE(
          SUM(
            CASE
              WHEN te.entryType = 'debit'  THEN te.amount
              WHEN te.entryType = 'credit' THEN -te.amount
              ELSE 0
            END
          ),
          0
        ) AS balance
      FROM wallets w
      LEFT JOIN TransactionEntry te
        ON te.ledgerId = w.ledgerId
      WHERE w.deletedAt IS NULL
      GROUP BY w.id, w.name, w.ledgerId
      ORDER BY w.name ASC
    `;

    db.transaction(tx => {
      tx.executeSql(
        query,
        [],
        (_, result) => {
          const rows: WalletBalanceRow[] = [];
          for (let i = 0; i < result.rows.length; i++) {
            rows.push(result.rows.item(i));
          }
          callback(rows);
        },
        (_, error) => {
          errorCallback?.(error);
          return false;
        }
      );
    });
  }
}
