import * as Notifications from 'expo-notifications';
import { DatabaseService } from '../database/db';

export class NotificationService {
  static async scheduleReminder(reminder, videoTitle) {
    try {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      const now = new Date();
      const triggerTime = new Date();
      triggerTime.setHours(hours);
      triggerTime.setMinutes(minutes);
      triggerTime.setSeconds(0);

      // Si la hora ya pasó hoy, programar para mañana
      if (triggerTime < now) {
        triggerTime.setDate(triggerTime.getDate() + 1);
      }

      let trigger;

      switch (reminder.frequency) {
        case 'daily':
          trigger = {
            hour: hours,
            minute: minutes,
            repeats: true,
          };
          break;

        case 'weekly':
          trigger = {
            weekday: reminder.dayOfWeek + 1, // 1-7 (lunes-domingo)
            hour: hours,
            minute: minutes,
            repeats: true,
          };
          break;

        case 'custom':
          trigger = {
            seconds: (reminder.intervalDays * 24 * 60 * 60),
            repeats: true,
          };
          break;

        case 'once':
        default:
          trigger = triggerTime;
          break;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Recordatorio: ' + videoTitle,
          body: 'Tienes un recordatorio para ver este video',
          data: { reminderId: reminder.id, videoTitle },
        },
        trigger,
      });

      return notificationId;
    } catch (error) {
      console.error('Error programando notificación:', error);
      throw error;
    }
  }

  static async cancelReminder(notificationId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Error cancelando notificación:', error);
    }
  }

  static async requestNotificationPermissions() {
    try {
      const permission = await Notifications.requestPermissionsAsync();
      return permission.granted;
    } catch (error) {
      console.error('Error solicitando permisos de notificación:', error);
      return false;
    }
  }

  static async sendTestNotification(title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: {
          seconds: 1,
        },
      });
    } catch (error) {
      console.error('Error enviando notificación de prueba:', error);
    }
  }
}
