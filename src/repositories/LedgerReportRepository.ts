import { getDatabase } from "./Database";

export type LedgerFilterType = 'ALL' | 'LEDGER' | 'CATEGORY' | 'WALLET';

export interface LedgerReportRow {
  date: string;
  ledgerId: number;
  ledgerName: string;
  amount: number;
}

export class LedgerReportRepository {
  static getReport(
    fromDate: string,
    toDate: string,
    filterType: LedgerFilterType,
    filterId?: number,
    keyword?: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<LedgerReportRow[]> {
    const db = getDatabase();

    let filterJoin = '';
    let filterWhere = '';
    const params: any[] = [fromDate, toDate];

    if (filterType === 'LEDGER') {
      filterWhere = 'AND l.id = ?';
      params.push(filterId);
    }

    if (filterType === 'CATEGORY') {
      filterJoin = `INNER JOIN categories c ON (c.ledgerId = l.id OR ts.categoryId = c.id)`;
      filterWhere = 'AND c.id = ?';
      params.push(filterId);
    }

    if (filterType === 'WALLET') {
      filterJoin = `INNER JOIN wallets w ON w.ledgerId = l.id`;
      filterWhere = 'AND w.id = ?';
      params.push(filterId);
    }

    let sql = `
      SELECT
        DATE(ts.date) as date,
        l.id as ledgerId,
        l.name as ledgerName,
        SUM(
          CASE
            WHEN te.entryType = 'debit' THEN te.amount
            ELSE -te.amount
          END
        ) as amount
      FROM TransactionEntry te
      INNER JOIN TransactionSummary ts ON ts.id = te.transactionSummaryId
      INNER JOIN Ledger l ON l.id = te.ledgerId
      ${filterJoin}
      WHERE ts.deletedAt IS NULL
        AND DATE(ts.date) BETWEEN DATE(?) AND DATE(?)
        ${filterWhere}
    `;

    if (keyword) {
      sql += ` AND (ts.note LIKE ? OR l.name LIKE ?)`;
      params.push(`%${keyword}%`, `%${keyword}%`);
    }

    sql += `
      GROUP BY DATE(ts.date), l.id, l.name
      ORDER BY DATE(ts.date) DESC, l.name ASC
      LIMIT ? OFFSET ?
    `;
    params.push(limit, offset);

    return new Promise((resolve, reject) => {
      db.transaction((tx: any) => {
        tx.executeSql(
          sql,
          params,
          (_: any, result: any) => {
             const rows = [];
             for (let i = 0; i < result.rows.length; i++) {
                 rows.push(result.rows.item(i));
             }
             resolve(rows as LedgerReportRow[]);
          },
          (_: any, error: any) => {
            console.error('Ledger report error', error);
            reject(error);
            return false;
          },
        );
      });
    });
  }

  static getReportTotal(
    fromDate: string,
    toDate: string,
    filterType: LedgerFilterType,
    filterId?: number,
    keyword?: string
  ): Promise<{total: number}> {
      return new Promise((resolve, reject) => {
        const db = getDatabase();
        let filterJoin = '';
        let filterWhere = '';
        const params: any[] = [fromDate, toDate];

        if (filterType === 'LEDGER') {
        filterWhere = 'AND l.id = ?';
        params.push(filterId);
        }

        if (filterType === 'CATEGORY') {
        filterJoin = `INNER JOIN categories c ON (c.ledgerId = l.id OR ts.categoryId = c.id)`;
        filterWhere = 'AND c.id = ?';
        params.push(filterId);
        }

        if (filterType === 'WALLET') {
        filterJoin = `INNER JOIN wallets w ON w.ledgerId = l.id`;
        filterWhere = 'AND w.id = ?';
        params.push(filterId);
        }

        let sql = `
        SELECT
            SUM(
            CASE
                WHEN te.entryType = 'debit' THEN te.amount
                ELSE -te.amount
            END
            ) as total
        FROM TransactionEntry te
        INNER JOIN TransactionSummary ts ON ts.id = te.transactionSummaryId
        INNER JOIN Ledger l ON l.id = te.ledgerId
        ${filterJoin}
        WHERE ts.deletedAt IS NULL
            AND DATE(ts.date) BETWEEN DATE(?) AND DATE(?)
            ${filterWhere}
        `;

        if (keyword) {
            sql += ` AND (ts.note LIKE ? OR l.name LIKE ?)`;
            params.push(`%${keyword}%`, `%${keyword}%`);
        }

        db.transaction((tx: any) => {
            tx.executeSql(
                sql,
                params,
                (_: any, result: any) => {
                    resolve({ total: result.rows.item(0).total || 0 });
                },
                (_: any, error: any) => reject(error)
            );
        });
      });
  }
}
