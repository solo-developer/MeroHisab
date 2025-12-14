import { getDatabase } from './Database';

export interface TransactionEntryCreate {
  transactionSummaryId: number;
  ledgerId: number;
  entryType: 'debit' | 'credit';
  amount: number;
  date: string;
}

export const TransactionEntryRepository = {
  create: (
    tx: any,
    data: TransactionEntryCreate,
    onSuccess: () => void,
    onError: (err: any) => void
  ) => {
    tx.executeSql(
      `
      INSERT INTO TransactionEntry (transactionSummaryId, ledgerId, entryType, amount, date)
      VALUES (?, ?, ?, ?, ?);
      `,
      [data.transactionSummaryId, data.ledgerId, data.entryType, data.amount, data.date],
      () => onSuccess(),
      (_, err) => {
        onError(err);
        return false;
      }
    );
  }
};
