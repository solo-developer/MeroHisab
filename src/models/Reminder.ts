export interface Reminder {
  id?: number;
  message: string;
  date: string; // ISO string
  isRecurring: boolean;
  frequency?: string; // 'daily', 'weekly', 'monthly', 'yearly'
  notificationId?: string;
  createdAt?: string;
}
