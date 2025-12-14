export interface CreateLedgerInput {
  name: string;
  type: 'asset' | 'expense' | 'income' | 'liability' | 'equity';
  isSystem?: boolean;
}

export const LedgerRepository = {
  create: (
    tx: SQLite.Transaction,
    input: CreateLedgerInput,
    onSuccess: (ledgerId: number) => void,
    onError: (e: any) => void
  ) => {
    tx.executeSql(
      `INSERT INTO Ledger (name, type, isSystem)
       VALUES (?, ?, ?);`,
      [input.name, input.type, input.isSystem ? 1 : 0],
      (_, result) => onSuccess(result.insertId as number),
      (_, e) => { onError(e); return false; }
    );
  }
};
