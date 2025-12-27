import { getDatabase } from './Database';
import { Ledger } from './LedgerRepository';

export interface MetaCategory {
  id: number;
  name: string;
}
export interface MetaCategoryLedgerRow {
  date: string;
  ledgerName: string;
  totalIncome: number;
  totalExpense: number;
}

export default class MetaCategoryRepository {

  static getAll(): Promise<MetaCategory[]> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT * FROM MetaCategory ORDER BY name;`,
          [],
          (_: any, res: any) => {
            const categories: MetaCategory[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              categories.push(res.rows.item(i));
            }
            resolve(categories);
          },
          (_: any, err: any) => reject(err)
        );
      });
    });
  }

  static create(name: string, ledgerIds: number[] = []): Promise<number> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `INSERT INTO MetaCategory (name) VALUES (?);`,
          [name],
          async (_: any, result: any) => {
            const metaCategoryId = result.insertId;

            // Assign ledgers
            if (ledgerIds.length > 0) {
              ledgerIds.forEach(lid => {
                tx.executeSql(
                  `INSERT INTO MetaCategoryItems (metaCategoryId, ledgerId) VALUES (?, ?);`,
                  [metaCategoryId, lid]
                );
              });
            }

            resolve(metaCategoryId);
          },
          (_: any, err: any) => reject(err)
        );
      });
    });
  }

  static update(id: number, name: string, ledgerIds: number[] = []): Promise<void> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `UPDATE MetaCategory SET name = ? WHERE id = ?;`,
          [name, id],
          () => {
            // Remove old assignments
            tx.executeSql(
              `DELETE FROM MetaCategoryItems WHERE metaCategoryId = ?;`,
              [id],
              () => {
                // Add new ledger assignments
                ledgerIds.forEach(lid => {
                  tx.executeSql(
                    `INSERT INTO MetaCategoryItems (metaCategoryId, ledgerId) VALUES (?, ?);`,
                    [id, lid]
                  );
                });
                resolve();
              }
            );
          },
          (_: any, err: any) => reject(err)
        );
      });
    });
  }

  static delete(id: number): Promise<void> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `DELETE FROM MetaCategory WHERE id = ?;`,
          [id],
          () => resolve(),
          (_: any, err: any) => reject(err)
        );
      });
    });
  }

  static getLedgers(metaCategoryId: number): Promise<Ledger[]> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          `SELECT l.* FROM Ledger l
           INNER JOIN MetaCategoryItems m ON l.id = m.ledgerId
           WHERE m.metaCategoryId = ?;`,
          [metaCategoryId],
          (_: any, res: any) => {
            const ledgers: Ledger[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              ledgers.push(res.rows.item(i));
            }
            resolve(ledgers);
          },
          (_: any, err: any) => reject(err)
        );
      });
    });
  }

  static async getReportByMetaCategory(
    metaCategoryId: number,
    fromDate?: string,
    toDate?: string,
    keyword?: string
  ): Promise<MetaCategoryLedgerRow[]> {
    const db = getDatabase();

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        // Fetch all ledger IDs under this meta category
        tx.executeSql(
          `SELECT ledgerId FROM MetaCategoryItems WHERE metaCategoryId = ?`,
          [metaCategoryId],
          (_: any, res: any) => {
            const ledgerIds: number[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              ledgerIds.push(res.rows.item(i).ledgerId);
            }

            if (ledgerIds.length === 0) {
              resolve([]);
              return;
            }

            // Flatten all transactions for these ledgers, grouped by date + ledger
            const placeholders = ledgerIds.map(() => '?').join(',');
            let query = `
              SELECT ts.date as date,
                     l.name as ledgerName,
                     SUM(CASE WHEN ts.type IN ('income', 'receipt') THEN ts.amount ELSE 0 END) AS totalIncome,
                     SUM(CASE WHEN ts.type IN ('expense', 'payment') THEN ts.amount ELSE 0 END) AS totalExpense
              FROM TransactionSummary ts
              JOIN TransactionEntry te ON te.transactionSummaryId = ts.id
              JOIN Ledger l ON l.id = te.ledgerId
              WHERE te.ledgerId IN (${placeholders}) AND ts.deletedAt IS NULL
            `;
            const params: any[] = [...ledgerIds];

            if (fromDate) {
              query += ` AND date(ts.date) >= ?`;
              params.push(fromDate);
            }
            if (toDate) {
              query += ` AND date(ts.date) <= ?`;
              params.push(toDate);
            }
            if (keyword) {
              query += ` AND (ts.note LIKE ? OR l.name LIKE ?)`;
              params.push(`%${keyword}%`, `%${keyword}%`);
            }

            query += `
              GROUP BY ts.date, te.ledgerId
              ORDER BY ts.date DESC
            `;

            tx.executeSql(
              query,
              params,
              (_: any, r: any) => {
                const rows: MetaCategoryLedgerRow[] = [];
                for (let i = 0; i < r.rows.length; i++) {
                  rows.push(r.rows.item(i));
                }
                resolve(rows);
              },
              (_: any, err: any) => reject(err)
            );
          },
          (_: any, err: any) => reject(err)
        );
      });
    });
  }
}
