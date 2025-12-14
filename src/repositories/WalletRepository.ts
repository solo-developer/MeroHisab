// src/repositories/WalletRepository.ts
import Wallet from '../models/Wallet';
import { getDatabase } from './Database';

export default class WalletRepository {
  static getAll(): Promise<Wallet[]> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'SELECT * FROM wallets ORDER BY name;',
          [],
          (_, res) => {
            const wallets: Wallet[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              const r = res.rows.item(i);
              wallets.push(new Wallet(r.name, r.balance, r.id));
            }
            resolve(wallets);
          },
          (_, err) => reject(err),
        );
      });
    });
  }

  static add(wallet: Wallet): Promise<void> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'INSERT INTO wallets (name, balance) VALUES (?, ?);',
          [wallet.name, wallet.balance],
          () => resolve(),
          (_, err) => reject(err),
        );
      });
    });
  }

  static update(wallet: Wallet): Promise<void> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'UPDATE wallets SET name=?, balance=? WHERE id=?;',
          [wallet.name, wallet.balance, wallet.id],
          () => resolve(),
          (_, err) => reject(err),
        );
      });
    });
  }

  static delete(id: number): Promise<void> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          'DELETE FROM wallets WHERE id=?;',
          [id],
          () => resolve(),
          (_, err) => reject(err),
        );
      });
    });
  }
}
