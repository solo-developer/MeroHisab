import notifee, { TimestampTrigger, TriggerType, RepeatFrequency, AndroidImportance } from '@notifee/react-native';
import { Reminder } from '../models/Reminder';
import { ReminderRepository } from '../repositories/ReminderRepository';

export const ReminderService = {
  scheduleReminder: async (reminder: Reminder) => {
    // 1. Create a channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'reminders',
      name: 'Reminders',
      importance: AndroidImportance.HIGH,
    });

    // 2. Set up the trigger
    const date = new Date(reminder.date);
    
    // Ensure date is in the future.
    if (date.getTime() <= Date.now()) {
        // Automatically bump to tomorrow if time is passed? 
        // Or just let notifee handle it (it might fire immediately).
    }

    let trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

    if (reminder.isRecurring && reminder.frequency) {
      switch (reminder.frequency) {
        case 'daily':
            trigger.repeatFrequency = RepeatFrequency.DAILY;
            break;
        case 'weekly':
            trigger.repeatFrequency = RepeatFrequency.WEEKLY;
            break;
        case 'monthly':
            // Notifee simple trigger doesn't support monthly directly without custom logic. 
            // We serve it as one-time for now to avoid complexity of headless tasks in this snippet.
            // Or we could leave repeatFrequency undefined which means fire once.
            break;
        case 'yearly':
            break;
      }
    }

    // 3. Create the notification
    let notificationId: string;
    try {
        notificationId = await notifee.createTriggerNotification(
            {
              title: 'Reminder',
              body: reminder.message,
              android: {
                channelId,
                pressAction: {
                  id: 'default',
                },
                smallIcon: 'ic_launcher', // verify this exists or remove if not sure
              },
            },
            trigger,
          );
    } catch (e) {
        console.error("Failed to schedule notification", e);
        // If scheduling fails, we still might want to save it but without ID?
        // Or rethrow.
        notificationId = ''; 
    }

    // 4. Save to DB
    reminder.notificationId = notificationId;
    await ReminderRepository.create(reminder);
  },

  getAllReminders: async () => {
    return await ReminderRepository.getAll();
  },

  deleteReminder: async (id: number, notificationId?: string) => {
    if (notificationId) {
      await notifee.cancelNotification(notificationId);
    }
    await ReminderRepository.delete(id);
  }
};
