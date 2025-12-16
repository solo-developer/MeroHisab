import { getDatabase } from './Database';

export interface TransactionEntryCreate {
  transactionSummaryId: number;
  ledgerId: number;
  entryType: 'debit' | 'credit';
  amount: number;
}
export interface TransactionEntryRow {
  id: number;
  transactionSummaryId: number;
  ledgerId: number;
  entryType: 'debit' | 'credit';
  amount: number;
  date: string; 
  type : 'expense' | 'income' | 'transfer' |'adjustment';
}

export const TransactionEntryRepository = {
  create: (
    tx: any,
    data: TransactionEntryCreate,
    onSuccess: () => void,
    onError: (err: any) => void,
  ) => {
    tx.executeSql(
      `
      INSERT INTO TransactionEntry (transactionSummaryId, ledgerId, entryType, amount)
      VALUES (?, ?, ?, ?);
      `,
      [data.transactionSummaryId, data.ledgerId, data.entryType, data.amount],
      () => onSuccess(),
      (_, err) => {
        onError(err);
        return false;
      },
    );
  },
  getEntriesBetweenDates: (
    startDate: string,
    endDate: string,
    onSuccess: (rows: TransactionEntryRow[]) => void,
    onError: (err: any) => void,
  ) => {
    const db = getDatabase();
    db.transaction(tx => {
      tx.executeSql(
        `
        SELECT te.id, te.transactionSummaryId, te.ledgerId, te.entryType, te.amount, ts.date, ts.type
        FROM TransactionEntry te
        JOIN TransactionSummary ts ON ts.id = te.transactionSummaryId
        WHERE ts.date BETWEEN ? AND ?
        `,
        [startDate, endDate],
        (_, res) => {
          const result: TransactionEntryRow[] = [];
          for (let i = 0; i < res.rows.length; i++) {
            result.push(res.rows.item(i));
          }
          onSuccess(result);
        },
        (_, err) => {
          onError(err);
          return false;
        },
      );
    });
  },
};
