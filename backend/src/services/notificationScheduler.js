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

  // ✅ ADD THIS METHOD - It's being called from calendarController
  async scheduleNotification(eventId, eventData) {
    try {
      console.log(`📅 Scheduling notification for event: ${eventId}`);
      
      const event = await CalendarEvent.findById(eventId);
      if (!event) {
        console.log(`❌ Event not found: ${eventId}`);
        return false;
      }

      // Reset notification flag so scheduler will pick it up
      event.notificationSent = false;
      await event.save();
      
      console.log(`✅ Notification scheduled for: ${event.title}`);
      return true;
    } catch (error) {
      console.error('Schedule notification error:', error);
      return false;
    }
  }

  async cancelNotification(eventId) {
    try {
      const event = await CalendarEvent.findById(eventId);
      if (event) {
        event.notificationSent = true;
        await event.save();
        console.log(`✅ Notification cancelled for: ${event.title}`);
      }
      return true;
    } catch (error) {
      console.error('Cancel notification error:', error);
      return false;
    }
  }
}

export default new NotificationScheduler();