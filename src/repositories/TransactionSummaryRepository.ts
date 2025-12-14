import { getDatabase } from './Database';

export interface TransactionSummaryCreate {
  type: string;
  note?: string;
  date: string;
}

export const TransactionSummaryRepository = {
  create: (
    tx: any,
    data: TransactionSummaryCreate,
    onSuccess: (id: number) => void,
    onError: (err: any) => void
  ) => {
    tx.executeSql(
      `INSERT INTO TransactionSummary (type, note, date) VALUES (?, ?, ?);`,
      [data.type, data.note || '', data.date],
      (_, res) => onSuccess(res.insertId),
      (_, err) => {
        onError(err);
        return false;
      }
    );
  }
};
