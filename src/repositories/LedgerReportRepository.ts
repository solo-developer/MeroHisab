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
  ): Promise<LedgerReportRow[]> {
    const db = getDatabase();

    let filterJoin = '';
    let filterWhere = '';
    const params: any[] = [fromDate, toDate];

    /**
     * Filtering logic based on schema
     */
    if (filterType === 'LEDGER') {
      filterWhere = 'AND l.id = ?';
      params.push(filterId);
    }

    if (filterType === 'CATEGORY') {
      filterJoin = `
        INNER JOIN categories c ON c.ledgerId = l.id
      `;
      filterWhere = 'AND c.id = ?';
      params.push(filterId);
    }

    if (filterType === 'WALLET') {
      filterJoin = `
        INNER JOIN wallets w ON w.ledgerId = l.id
      `;
      filterWhere = 'AND w.id = ?';
      params.push(filterId);
    }

    const sql = `
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
      INNER JOIN TransactionSummary ts 
        ON ts.id = te.transactionSummaryId
      INNER JOIN Ledger l 
        ON l.id = te.ledgerId
      ${filterJoin}
      WHERE ts.deletedAt IS NULL
        AND DATE(ts.date) BETWEEN DATE(?) AND DATE(?)
        ${filterWhere}
      GROUP BY DATE(ts.date), l.id, l.name
      ORDER BY DATE(ts.date) DESC, l.name ASC
    `;

    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          sql,
          params,
          (_, result) => resolve(result.rows._array as LedgerReportRow[]),
          (_, error) => {
            console.error('Ledger report error', error);
            reject(error);
            return false;
          },
        );
      });
    });
  }
}
