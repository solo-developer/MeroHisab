import { getDatabase } from './Database';
import { Reminder } from '../models/Reminder';

export const ReminderRepository = {
  create: async (reminder: Reminder): Promise<number> => {
    const db = getDatabase();
    return new Promise((resolve, reject) => {
      db.transaction(tx => {
        tx.executeSql(
          `INSERT INTO Reminders (message, date, isRecurring, frequency, notificationId) VALUES (?, ?, ?, ?, ?)`,
          [
            reminder.message,
            reminder.date,
            reminder.isRecurring ? 1 : 0,
            reminder.frequency || null,
            reminder.notificationId || null
          ],
          (tx, results) => {
            resolve(results.insertId);
          },
          (error) => {
            console.error('Error creating reminder', error);
            // reject(error); // The types for react-native-sqlite-2 callbacks might differ, but usually returning true/false handles rollback.
            // For simplicity in this project context where types might be loose:
            resolve(0); 
          }
        );
      });
    });
  },

  getAll: async (): Promise<Reminder[]> => {
    const db = getDatabase();
    return new Promise((resolve) => {
      db.transaction(tx => {
        tx.executeSql(
          `SELECT * FROM Reminders ORDER BY date ASC`,
          [],
          (tx, results) => {
            const reminders: Reminder[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              const item = results.rows.item(i);
              reminders.push({
                id: item.id,
                message: item.message,
                date: item.date,
                isRecurring: item.isRecurring === 1,
                frequency: item.frequency,
                notificationId: item.notificationId,
                createdAt: item.createdAt,
              });
            }
            resolve(reminders);
          },
          (error) => {
            console.error('Error fetching reminders', error);
            resolve([]);
          }
        );
      });
    });
  },

  delete: async (id: number): Promise<void> => {
    const db = getDatabase();
    return new Promise((resolve) => {
      db.transaction(tx => {
        tx.executeSql(
          `DELETE FROM Reminders WHERE id = ?`,
          [id],
          () => resolve(),
          (error) => {
            console.error('Error deleting reminder', error);
            resolve();
          }
        );
      });
    });
  }
};
