import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { Task } from '../types';

export const NOTIFICATION_CHANNEL_ID = 'task_reminders';
export const TEST_NOTIFICATION_ID = 999901;
export const ONE_MIN_TEST_ID = 999902;

/**
 * Deterministically convert a string taskId into a valid positive 32-bit integer ID for Capacitor LocalNotifications.
 */
export function taskIdToNotificationId(taskId: string): number {
  let hash = 0;
  for (let i = 0; i < taskId.length; i++) {
    const char = taskId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  // Ensure positive number between 1 and 2,000,000,000
  return (Math.abs(hash) % 2000000000) + 1;
}

/**
 * Calculate the trigger Date for a task based on its dueDate and dueTime/reminderTime.
 */
export function calculateTaskReminderDate(task: Task): Date | null {
  if (!task.dueDate) return null;

  try {
    const [year, month, day] = task.dueDate.split('-').map(Number);
    if (!year || !month || !day) return null;

    let targetHour = 9;
    let targetMinute = 0;

    // Check if reminderTime is a specific time like "08:50"
    if (task.reminderTime && task.reminderTime.includes(':')) {
      const [h, m] = task.reminderTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        targetHour = h;
        targetMinute = m;
      }
    } else if (task.dueTime && task.dueTime.includes(':')) {
      const [h, m] = task.dueTime.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        targetHour = h;
        targetMinute = m;

        // If reminderTime is relative (e.g. "10m before", "15m before")
        if (task.reminderTime && task.reminderTime.includes('m before')) {
          const minsBefore = parseInt(task.reminderTime, 10);
          if (!isNaN(minsBefore)) {
            const tempDate = new Date(year, month - 1, day, targetHour, targetMinute, 0);
            return new Date(tempDate.getTime() - minsBefore * 60 * 1000);
          }
        }
      }
    }

    const scheduledDate = new Date(year, month - 1, day, targetHour, targetMinute, 0);
    return scheduledDate;
  } catch (err) {
    console.error('Error parsing task reminder date:', err);
    return null;
  }
}

class NotificationService {
  private isInitialized = false;
  private tapListeners: Array<(taskId: string, extra?: Record<string, unknown>) => void> = [];
  private receivedListeners: Array<(notification: LocalNotificationSchema) => void> = [];

  /**
   * Initialize notification channels and tap/received listeners.
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 1. Android 8.0+ requires a Notification Channel
      await this.setupChannel();

      // 2. Setup Action Performed (Notification Tap) listener
      await LocalNotifications.addListener(
        'localNotificationActionPerformed',
        (notificationAction) => {
          console.log('Local notification tapped:', notificationAction);
          const extra = notificationAction.notification?.extra || {};
          const taskId = extra.taskId as string;
          if (taskId) {
            this.tapListeners.forEach((listener) => listener(taskId, extra));
          }
        }
      );

      // 3. Setup Received listener (Foreground notifications)
      await LocalNotifications.addListener(
        'localNotificationReceived',
        (notification) => {
          console.log('Local notification received in foreground:', notification);
          this.receivedListeners.forEach((listener) => listener(notification));
        }
      );

      this.isInitialized = true;
    } catch (err) {
      console.warn('Capacitor LocalNotifications init warning (likely running in standard web browser):', err);
    }
  }

  /**
   * Set up Android Notification Channel
   */
  async setupChannel(): Promise<void> {
    try {
      await LocalNotifications.createChannel({
        id: NOTIFICATION_CHANNEL_ID,
        name: 'Task Reminders',
        description: 'Scheduled reminders and alerts for tasks and to-dos',
        importance: 5, // Android NotificationManager.IMPORTANCE_HIGH
        visibility: 1, // NotificationCompat.VISIBILITY_PUBLIC
        sound: 'beep.wav',
        vibration: true,
        lights: true,
        lightColor: '#3B82F6',
      });
      console.log('Notification channel created successfully');
    } catch (err) {
      // On web, createChannel is a no-op or may throw
      console.log('setupChannel notice:', err);
    }
  }

  /**
   * Check if notification permission is granted
   */
  async checkPermission(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const status = await LocalNotifications.checkPermissions();
        return status.display === 'granted';
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        return Notification.permission === 'granted';
      }
      return false;
    } catch (err) {
      console.warn('Error checking notification permission:', err);
      return false;
    }
  }

  /**
   * Request notification permission from user
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (Capacitor.isNativePlatform()) {
        const status = await LocalNotifications.requestPermissions();
        return status.display === 'granted';
      } else if (typeof window !== 'undefined' && 'Notification' in window) {
        const perm = await Notification.requestPermission();
        return perm === 'granted';
      }
      return false;
    } catch (err) {
      console.warn('Error requesting notification permission:', err);
      return false;
    }
  }

  /**
   * Schedule notification for a specific task
   */
  async scheduleTask(task: Task): Promise<boolean> {
    // If completed or reminder disabled, cancel any existing
    if (task.completed || !task.reminderEnabled) {
      await this.cancelTask(task.id);
      return false;
    }

    const scheduledDate = calculateTaskReminderDate(task);
    if (!scheduledDate) return false;

    // Check if target is in the future
    const now = Date.now();
    if (scheduledDate.getTime() <= now) {
      // Past time, do not schedule
      return false;
    }

    const notifId = taskIdToNotificationId(task.id);

    try {
      // Cancel any previous notification with this ID first
      await this.cancelTask(task.id);

      // Build notification payload
      const notification: LocalNotificationSchema = {
        id: notifId,
        title: `⏰ ${task.title}`,
        body: task.description || (task.notes ? task.notes.slice(0, 80) : `Scheduled for ${task.dueTime || 'today'}`),
        schedule: {
          at: scheduledDate,
          allowWhileIdle: true, // CRITICAL: fires even when phone is in Android Doze / backgrounded
        },
        channelId: NOTIFICATION_CHANNEL_ID,
        sound: 'beep.wav',
        smallIcon: 'ic_stat_name',
        actionTypeId: '',
        extra: {
          taskId: task.id,
          title: task.title,
          dueTime: task.dueTime || '09:00',
          dueDate: task.dueDate,
        },
      };

      await LocalNotifications.schedule({
        notifications: [notification],
      });

      console.log(`Scheduled reminder for task "${task.title}" at ${scheduledDate.toLocaleString()} (ID: ${notifId})`);
      return true;
    } catch (err) {
      console.error(`Failed to schedule reminder for task ${task.id}:`, err);
      return false;
    }
  }

  /**
   * Cancel scheduled reminder for a task
   */
  async cancelTask(taskId: string): Promise<void> {
    try {
      const notifId = taskIdToNotificationId(taskId);
      await LocalNotifications.cancel({
        notifications: [{ id: notifId }],
      });
      console.log(`Cancelled reminder for taskId: ${taskId} (ID: ${notifId})`);
    } catch (err) {
      console.warn(`Could not cancel notification for ${taskId}:`, err);
    }
  }

  /**
   * Reschedule all pending active tasks after app launch / restart
   */
  async rescheduleAll(tasks: Task[], notificationsEnabled: boolean): Promise<number> {
    if (!notificationsEnabled) {
      try {
        const pending = await LocalNotifications.getPending();
        if (pending.notifications.length > 0) {
          await LocalNotifications.cancel(pending);
        }
      } catch (e) {
        console.warn('Error clearing pending notifications:', e);
      }
      return 0;
    }

    let scheduledCount = 0;
    const now = Date.now();

    for (const task of tasks) {
      if (!task.completed && task.reminderEnabled) {
        const targetDate = calculateTaskReminderDate(task);
        if (targetDate && targetDate.getTime() > now) {
          const success = await this.scheduleTask(task);
          if (success) scheduledCount++;
        }
      }
    }

    console.log(`Rescheduled ${scheduledCount} active task reminders.`);
    return scheduledCount;
  }

  /**
   * Send an immediate test notification (fires in 3 seconds)
   */
  async sendTestNotification(): Promise<boolean> {
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) return false;
    }

    try {
      // Schedule 3 seconds from now so it registers properly with AlarmManager / notification queue
      const atDate = new Date(Date.now() + 3000);

      await LocalNotifications.schedule({
        notifications: [
          {
            id: TEST_NOTIFICATION_ID,
            title: '🔔 Test Notification',
            body: 'Capacitor Android notifications are working properly!',
            schedule: {
              at: atDate,
              allowWhileIdle: true,
            },
            channelId: NOTIFICATION_CHANNEL_ID,
            sound: 'beep.wav',
            smallIcon: 'ic_stat_name',
            extra: {
              isTest: true,
              taskId: 'test-instant-task',
            },
          },
        ],
      });

      // Also trigger Web Notification if in browser mode for instant preview feedback
      if (!Capacitor.isNativePlatform() && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          new Notification('🔔 Test Notification', {
            body: 'Capacitor Android notifications are working properly!',
            icon: '/pwa-192x192.png',
          });
        }, 3000);
      }

      return true;
    } catch (err) {
      console.error('Error sending test notification:', err);
      return false;
    }
  }

  /**
   * Schedule a 1-minute test reminder (fires in 60 seconds)
   */
  async scheduleOneMinuteTest(): Promise<{ success: boolean; fireTime: string }> {
    const hasPermission = await this.checkPermission();
    if (!hasPermission) {
      const granted = await this.requestPermission();
      if (!granted) return { success: false, fireTime: '' };
    }

    try {
      const fireDate = new Date(Date.now() + 60 * 1000);
      const fireTimeStr = fireDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

      await LocalNotifications.schedule({
        notifications: [
          {
            id: ONE_MIN_TEST_ID,
            title: '⏰ 1-Minute Test Reminder',
            body: `Your background test reminder triggered at ${fireTimeStr}!`,
            schedule: {
              at: fireDate,
              allowWhileIdle: true,
            },
            channelId: NOTIFICATION_CHANNEL_ID,
            sound: 'beep.wav',
            smallIcon: 'ic_stat_name',
            extra: {
              isTest: true,
              taskId: 'test-1min-task',
            },
          },
        ],
      });

      // Browser fallback if not native
      if (!Capacitor.isNativePlatform() && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          new Notification('⏰ 1-Minute Test Reminder', {
            body: `Your background test reminder triggered at ${fireTimeStr}!`,
            icon: '/pwa-192x192.png',
          });
        }, 60 * 1000);
      }

      return { success: true, fireTime: fireTimeStr };
    } catch (err) {
      console.error('Error scheduling 1-minute test reminder:', err);
      return { success: false, fireTime: '' };
    }
  }

  /**
   * Register notification tap listener
   */
  onNotificationTap(callback: (taskId: string, extra?: Record<string, unknown>) => void): () => void {
    this.tapListeners.push(callback);
    return () => {
      this.tapListeners = this.tapListeners.filter((cb) => cb !== callback);
    };
  }

  /**
   * Register notification received listener (foreground)
   */
  onNotificationReceived(callback: (notification: LocalNotificationSchema) => void): () => void {
    this.receivedListeners.push(callback);
    return () => {
      this.receivedListeners = this.receivedListeners.filter((cb) => cb !== callback);
    };
  }
}

export const notificationService = new NotificationService();
