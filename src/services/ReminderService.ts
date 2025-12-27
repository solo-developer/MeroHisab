import notifee, { TimestampTrigger, TriggerType, RepeatFrequency, AndroidImportance, AndroidVisibility } from '@notifee/react-native';
import { Reminder } from '../models/Reminder';
import { ReminderRepository } from '../repositories/ReminderRepository';

export const ReminderService = {
  /**
   * Request notification permissions (required for Android 13+)
   */
  requestPermissions: async () => {
    const settings = await notifee.requestPermission();
    return settings.authorizationStatus >= 1; // 1 = Authorized
  },

  scheduleReminder: async (reminder: Reminder) => {
    // 0. Permission check
    await ReminderService.requestPermissions();

    // 1. Create a high-priority channel (required for Android)
    const channelId = await notifee.createChannel({
      id: 'reminders',
      name: 'Budget Reminders',
      importance: AndroidImportance.HIGH,
      visibility: AndroidVisibility.PUBLIC,
      sound: 'default',
    });

    // 2. Set up the trigger
    const date = new Date(reminder.date);
    
    // If the date is in the past and not recurring, we probably shouldn't schedule it
    if (date.getTime() <= Date.now() && !reminder.isRecurring) {
        throw new Error('Please select a future date and time.');
    }

    let trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
      alarmManager: true, // Use exact alarms for higher reliability
    };

    if (reminder.isRecurring && reminder.frequency) {
        switch (reminder.frequency) {
            case 'daily':
                trigger.repeatFrequency = RepeatFrequency.DAILY;
                break;
            case 'weekly':
                trigger.repeatFrequency = RepeatFrequency.WEEKLY;
                break;
        }
    }

    // 3. Create the notification
    let notificationId: string;
    try {
        notificationId = await notifee.createTriggerNotification(
            {
              title: '🔔 Mero Hisab Reminder',
              body: reminder.message,
              android: {
                channelId,
                importance: AndroidImportance.HIGH,
                pressAction: {
                  id: 'default',
                },
                smallIcon: 'ic_launcher', 
              },
              ios: {
                critical: true,
              }
            },
            trigger,
          );
    } catch (e) {
        console.error("Failed to schedule notification", e);
        notificationId = ''; 
    }

    // 4. Save to DB
    reminder.notificationId = notificationId;
    return await ReminderRepository.create(reminder);
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
