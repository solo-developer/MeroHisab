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
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM MetaCategory ORDER BY name;`,
          [],
          (_, res) => {
            const categories: MetaCategory[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              categories.push(res.rows.item(i));
            }
            resolve(categories);
          },
          (_, err) => reject(err)
        );
      });
    });
  }

  static create(name: string, ledgerIds: number[] = []): Promise<number> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO MetaCategory (name) VALUES (?);`,
          [name],
          async (_, result) => {
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
          (_, err) => reject(err)
        );
      });
    });
  }

  static update(id: number, name: string, ledgerIds: number[] = []): Promise<void> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
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
          (_, err) => reject(err)
        );
      });
    });
  }

  static delete(id: number): Promise<void> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM MetaCategory WHERE id = ?;`,
          [id],
          () => resolve(),
          (_, err) => reject(err)
        );
      });
    });
  }

  static getLedgers(metaCategoryId: number): Promise<Ledger[]> {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT l.* FROM Ledger l
           INNER JOIN MetaCategoryItems m ON l.id = m.ledgerId
           WHERE m.metaCategoryId = ?;`,
          [metaCategoryId],
          (_, res) => {
            const ledgers: Ledger[] = [];
            for (let i = 0; i < res.rows.length; i++) {
              ledgers.push(res.rows.item(i));
            }
            resolve(ledgers);
          },
          (_, err) => reject(err)
        );
      });
    });
  }

  static async getReportByMetaCategory(
    metaCategoryId: number,
    fromDate?: string,
    toDate?: string
  ): Promise<MetaCategoryLedgerRow[]> {
    const db = getDatabase();
debugger;
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        // Fetch all ledger IDs under this meta category
        tx.executeSql(
          `SELECT ledgerId FROM MetaCategoryItems WHERE metaCategoryId = ?`,
          [metaCategoryId],
          (_, res) => {
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
                     SUM(CASE WHEN ts.type='income' THEN ts.amount ELSE 0 END) AS totalIncome,
                     SUM(CASE WHEN ts.type='expense' THEN ts.amount ELSE 0 END) AS totalExpense
              FROM TransactionSummary ts
              JOIN TransactionEntry te ON te.transactionSummaryId = ts.id
              JOIN Ledger l ON l.id = te.ledgerId
              WHERE te.ledgerId IN (${placeholders})
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

            query += `
              GROUP BY ts.date, te.ledgerId
              ORDER BY ts.date ASC
            `;

            tx.executeSql(
              query,
              params,
              (_, r) => {
                const rows: MetaCategoryLedgerRow[] = [];
                for (let i = 0; i < r.rows.length; i++) {
                  rows.push(r.rows.item(i));
                }
                resolve(rows);
              },
              (_, err) => reject(err)
            );
          },
          (_, err) => reject(err)
        );
      });
    });
  }
}
