export interface Party {
  id?: number;
  name: string;
  type: 'debtor' | 'creditor';
  initialBalance: number;
  currentBalance: number;
  ledgerId: number;
  createdAt?: string;
  deletedAt?: string | null;
}
