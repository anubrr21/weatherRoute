// backend/src/services/notificationScheduler.js
import cron from 'node-cron';
import CalendarEvent from '../models/CalendarEvent.js';
import onesignalService from './onesignalService.js';

class NotificationScheduler {
  constructor() {
    this.scheduledJobs = new Map();
    this.initScheduler();
  }

  initScheduler() {
    // Run every hour to check for upcoming events
    cron.schedule('0 * * * *', async () => {
      console.log('🕐 Checking for upcoming events...');
      await this.checkAndSendNotifications();
    });
  }

  async checkAndSendNotifications() {
    const now = new Date();
    const events = await CalendarEvent.find({
      isActive: true,
      notificationSent: false,
      startDateTime: { $gt: now }
    });
    
    for (const event of events) {
      const hoursUntilEvent = (event.startDateTime - now) / (1000 * 60 * 60);
      
      if (hoursUntilEvent <= event.notificationHours && hoursUntilEvent > 0) {
        await this.sendNotification(event);
        event.notificationSent = true;
        event.lastNotificationSentAt = now;
        await event.save();
      }
    }
  }

  async scheduleNotification(event) {
    const eventTime = new Date(event.startDateTime);
    const notificationTime = new Date(eventTime.getTime() - (event.notificationHours * 60 * 60 * 1000));
    
    if (notificationTime > new Date()) {
      // Store for cron job to handle
      console.log(`📅 Notification scheduled for event: ${event.title} at ${notificationTime}`);
    }
  }

  async rescheduleNotification(event) {
    await this.cancelNotification(event._id);
    await this.scheduleNotification(event);
  }

  async cancelNotification(eventId) {
    // Cron will handle - just mark for rescheduling
    console.log(`📅 Notification cancelled for event: ${eventId}`);
  }

  async sendNotification(event) {
    try {
      const title = `✈️ Upcoming Trip: ${event.title}`;
      const message = `${event.startLocation} → ${event.endLocation}\nStarts at: ${new Date(event.startDateTime).toLocaleString()}`;
      
      await onesignalService.sendNotificationToUser(event.userId, title, message, {
        eventId: event._id,
        type: 'calendar_event',
        startLocation: event.startLocation,
        endLocation: event.endLocation
      });
      
      console.log(`✅ Notification sent for event: ${event.title}`);
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  }
}

export default new NotificationScheduler();