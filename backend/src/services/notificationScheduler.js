// backend/src/services/notificationScheduler.js
import cron from 'node-cron';
import CalendarEvent from '../models/CalendarEvent.js';
import oneSignalService from './oneSignalService.js';

class NotificationScheduler {
  constructor() {
    this.initScheduler();
  }

  initScheduler() {
    // Run every 15 minutes to check for upcoming events
    cron.schedule('*/15 * * * *', async () => {
      console.log('🕐 Checking for upcoming events...');
      await this.checkAndSendNotifications();
    });

    // Run daily at 9 AM for promotional notifications
    cron.schedule('0 9 * * *', async () => {
      console.log('📨 Sending daily promotional notifications...');
      await this.sendDailyPromotions();
    });

    // Run daily at 8 PM for next day trip reminders
    cron.schedule('0 20 * * *', async () => {
      console.log('🌙 Sending next day trip reminders...');
      await this.sendNextDayReminders();
    });

    console.log('✅ Notification scheduler initialized');
  }

  async checkAndSendNotifications() {
    try {
      const now = new Date();
      
      const events = await CalendarEvent.find({
        isActive: true,
        notificationSent: false,
        startDateTime: { $gt: now }
      }).populate('userId');

      for (const event of events) {
        const hoursUntilEvent = (event.startDateTime - now) / (1000 * 60 * 60);
        
        if (hoursUntilEvent <= event.notificationHours && hoursUntilEvent > 0) {
          const sent = await oneSignalService.sendTripReminder(
            event.userId._id,
            {
              title: event.title,
              startDateTime: event.startDateTime,
              startLocation: event.startLocation,
              endLocation: event.endLocation,
              tripId: event._id
            }
          );

          if (sent) {
            event.notificationSent = true;
            event.lastNotificationSentAt = now;
            await event.save();
            console.log(`✅ Notification sent for: ${event.title}`);
          }
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }

  async sendDailyPromotions() {
    try {
      const users = await CalendarEvent.distinct('userId');
      
      for (const userId of users) {
        await oneSignalService.sendPromotionalNotification(
          userId,
          '🌤️ Good Morning! Plan Your Day with WeatherRoute',
          'Check today\'s weather and plan your trips with real-time updates!',
          '/dashboard'
        );
      }
    } catch (error) {
      console.error('Daily promotion error:', error);
    }
  }

  async sendNextDayReminders() {
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const nextDay = new Date(tomorrow);
      nextDay.setDate(nextDay.getDate() + 1);

      const events = await CalendarEvent.find({
        isActive: true,
        startDateTime: { $gte: tomorrow, $lt: nextDay }
      }).populate('userId');

      for (const event of events) {
        await oneSignalService.sendTripReminder(
          event.userId._id,
          {
            title: event.title,
            startDateTime: event.startDateTime,
            startLocation: event.startLocation,
            endLocation: event.endLocation,
            tripId: event._id
          }
        );
        console.log(`✅ Next day reminder sent for: ${event.title}`);
      }
    } catch (error) {
      console.error('Next day reminder error:', error);
    }
  }
}

export default new NotificationScheduler();