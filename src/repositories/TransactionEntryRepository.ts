import { getDatabase } from './Database';

export interface TransactionEntryCreate {
  transactionSummaryId: number;
  ledgerId: number;
  entryType: 'debit' | 'credit';
  amount: number;
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
      INSERT INTO TransactionEntry (transactionSummaryId, ledgerId, entryType, amount)
      VALUES (?, ?, ?, ?);
      `,
      [data.transactionSummaryId, data.ledgerId, data.entryType, data.amount],
      () => onSuccess(),
      (_, err) => {
        onError(err);
        return false;
      }
    );
  }
};
