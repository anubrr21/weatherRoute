// backend/src/services/notificationScheduler.js
import cron from 'node-cron';
import CalendarEvent from '../models/CalendarEvent.js';
import oneSignalService from './oneSignalService.js';
import weatherService from './weatherService.js';

class NotificationScheduler {
  constructor() {
    this.initScheduler();
  }

  initScheduler() {
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
          // ✅ Fetch weather for destination
          let weatherData = null;
          if (event.endLocation) {
            try {
              // Try to get weather for destination
              const searchResult = await weatherService.searchCities(event.endLocation);
              if (searchResult && searchResult.length > 0) {
                const city = searchResult[0];
                const weather = await weatherService.getCurrentWeather(city.lat, city.lon);
                if (weather) {
                  weatherData = {
                    condition: weather.condition,
                    temp: weather.temp,
                    description: weather.description
                  };
                }
              }
            } catch (weatherError) {
              console.log('Weather fetch failed for notification, continuing...');
            }
          }

          // ✅ Get route data if available
          let routeData = null;
          if (event.startLocation && event.endLocation) {
            // Try to get route data from your route service
            // This is a simplified version - you can enhance this
            routeData = {
              distance: '-- km',
              duration: '-- min'
            };
          }

          const sent = await oneSignalService.sendTripReminder(
            event.userId._id,
            {
              title: event.title,
              startDateTime: event.startDateTime,
              startLocation: event.startLocation || 'Unknown',
              endLocation: event.endLocation || 'Unknown',
              tripId: event._id,
              distance: routeData?.distance || '-- km',
              duration: routeData?.duration || '-- min',
              weatherCondition: weatherData?.condition || 'Clear',
              weatherTemp: weatherData?.temp || '--',
              weatherDescription: weatherData?.description || ''
            }
          );

          if (sent) {
            event.notificationSent = true;
            event.lastNotificationSentAt = now;
            await event.save();
            console.log(`✅ Enhanced notification sent for: ${event.title}`);
          }
        }
      }
    } catch (error) {
      console.error('Scheduler error:', error);
    }
  }

  async scheduleNotification(eventId, eventData) {
    try {
      console.log(`📅 Scheduling notification for event: ${eventId}`);
      
      const event = await CalendarEvent.findById(eventId);
      if (!event) {
        console.log(`❌ Event not found: ${eventId}`);
        return false;
      }

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