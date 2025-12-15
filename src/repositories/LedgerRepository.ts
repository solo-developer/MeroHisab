import SQLite from 'react-native-sqlite-2';
import { getDatabase } from './Database';

export interface Ledger {
  id?: number;
  name: string;
  type: 'asset' | 'expense' | 'income' | 'liability' | 'equity';
  isSystem?: boolean;
}

export interface CreateLedgerInput {
  name: string;
  type: 'asset' | 'expense' | 'income' | 'liability' | 'equity';
  isSystem?: boolean;
}

export const LedgerRepository = {
  /**
   * Create a ledger (inside a transaction)
   */
  create: (
    tx: SQLite.Transaction,
    input: CreateLedgerInput,
    onSuccess: (ledgerId: number) => void,
    onError: (e: any) => void,
  ) => {
    tx.executeSql(
      `INSERT INTO Ledger (name, type, isSystem, deletedAt)
       VALUES (?, ?, ?, NULL);`,
      [input.name, input.type, input.isSystem ? 1 : 0],
      (_, result) => onSuccess(result.insertId as number),
      (_, e) => {
        onError(e);
        return false;
      },
    );
  },

  /**
   * Fetch all ledgers (non-deleted)
   */
  getAll: (): Promise<Ledger[]> => {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT id, name, type, isSystem
           FROM Ledger
           WHERE deletedAt IS NULL AND isSystem = 0
           ORDER BY name;`,
          [],
          (_, res) => {
            const ledgers: Ledger[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              const r = res.rows.item(i);
              ledgers.push({
                id: r.id,
                name: r.name,
                type: r.type,
                isSystem: !!r.isSystem,
              });
            }
            resolve(ledgers);
          },
          (_, e) => {
            reject(e);
            return false;
          },
        );
      });
    });
  },

  /**
   * Soft delete a ledger
   */
  delete: (ledgerId: number): Promise<void> => {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `UPDATE Ledger SET deletedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL;`,
          [ledgerId],
          () => resolve(),
          (_, e) => {
            reject(e);
            return false;
          },
        );
      });
    });
  },

  getLedgerByCode: (
    tx: SQLite.Transaction,
    code: string,
    onSuccess: (
      ledger: {
        id: number;
        name: string;
        type: string;
        isSystem: boolean;
      } | null,
    ) => void,
    onError?: (err: any) => void,
  ) => {
    tx.executeSql(
      `SELECT id, name, type, isSystem
     FROM Ledger
     WHERE code = ? AND deletedAt IS NULL
     LIMIT 1;`,
      [code],
      (_, res) => {
        if (res.rows.length > 0) {
          const r = res.rows.item(0);
          onSuccess({
            id: r.id,
            name: r.name,
            type: r.type,
            isSystem: !!r.isSystem,
          });
        } else {
          onSuccess(null);
        }
      },
      (_, err) => {
        if (onError) onError(err);
        return false;
      },
    );
  },

  ensureExternalLedger: (
    tx: SQLite.Transaction,
    onSuccess: (ledgerId: number) => void,
    onError: (e: any) => void
  ) => {
    tx.executeSql(
      `SELECT id FROM Ledger WHERE isSystem = 1 AND name = 'External' AND deletedAt IS NULL;`,
      [],
      (_, res) => {
        if (res.rows.length > 0) {
          onSuccess(res.rows.item(0).id);
        } else {
          tx.executeSql(
            `INSERT INTO Ledger (name, type, isSystem) VALUES ('External', 'equity', 1);`,
            [],
            (_, result) => onSuccess(result.insertId as number),
            (_, e) => { onError(e); return false; }
          );
        }
      },
      (_, e) => { onError(e); return false; }
    );
  }
};
