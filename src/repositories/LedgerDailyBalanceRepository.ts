import { getDatabase } from './Database';

export const LedgerDailyBalanceRepository = {
  // Update closing balance for ledger/date, or insert if missing
  updateBalance: (
    tx: any,
    ledgerId: number,
    date: string,
    openingBalance: number,
    closingBalance: number,
    onSuccess: () => void,
    onError: (err: any) => void
  ) => {
    // Try update first
    tx.executeSql(
      `
      UPDATE LedgerDailyBalance
      SET openingBalance=?, closingBalance=?
      WHERE ledgerId=? AND date=?;
      `,
      [openingBalance, closingBalance, ledgerId, date],
      (_, res) => {
        if (res.rowsAffected === 0) {
          // Insert if missing
          tx.executeSql(
            `
            INSERT INTO LedgerDailyBalance (ledgerId, date, openingBalance, closingBalance)
            VALUES (?, ?, ?, ?);
            `,
            [ledgerId, date, openingBalance, closingBalance],
            () => onSuccess(),
            (_, err) => {
              onError(err);
              return false;
            }
          );
        } else {
          onSuccess();
        }
      },
      (_, err) => {
        onError(err);
        return false;
      }
    );
  }
};
