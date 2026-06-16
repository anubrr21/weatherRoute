// backend/src/services/calendarService.js
import CalendarEvent from '../models/CalendarEvent.js';
import notificationScheduler from './notificationScheduler.js';

class CalendarService {
  async createEvent(userId, eventData) {
    const event = new CalendarEvent({
      userId,
      ...eventData
    });
    
    await event.save();
    
    // Schedule notification
    if (event.notificationHours > 0 && event.startDateTime) {
      await notificationScheduler.scheduleNotification(event);
    }
    
    return event;
  }

  async getEvents(userId, startDate, endDate) {
    const query = {
      userId,
      isActive: true,
      startDateTime: {
        $gte: startDate || new Date(0),
        $lte: endDate || new Date(8640000000000000)
      }
    };
    
    return await CalendarEvent.find(query).sort({ startDateTime: 1 });
  }

  async updateEvent(eventId, userId, updates) {
    const event = await CalendarEvent.findOne({ _id: eventId, userId });
    if (!event) return null;
    
    Object.assign(event, updates);
    await event.save();
    
    // Reschedule notification if time changed
    if (updates.startDateTime || updates.notificationHours) {
      await notificationScheduler.rescheduleNotification(event);
    }
    
    return event;
  }

  async deleteEvent(eventId, userId) {
    const event = await CalendarEvent.findOneAndUpdate(
      { _id: eventId, userId },
      { isActive: false },
      { new: true }
    );
    
    if (event) {
      await notificationScheduler.cancelNotification(event._id);
    }
    
    return event;
  }

  async getUpcomingEvents(userId, hours = 24) {
    const now = new Date();
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    
    return await CalendarEvent.find({
      userId,
      isActive: true,
      notificationSent: false,
      startDateTime: { $gte: now, $lte: future }
    }).sort({ startDateTime: 1 });
  }

  async createRegularTripFromPreferences(userId, tripName, preferences) {
    const regularTrip = preferences.regularTrips?.find(t => t.name === tripName);
    if (!regularTrip) return null;
    
    // Get next occurrence (next weekend)
    const nextDate = this.getNextWeekendDate();
    
    const event = await this.createEvent(userId, {
      title: tripName,
      type: 'regular_trip',
      startLocation: regularTrip.startLocation,
      endLocation: regularTrip.endLocation,
      startDateTime: nextDate,
      notificationHours: 12,
      notes: `Regular trip: ${regularTrip.startLocation} → ${regularTrip.endLocation}`
    });
    
    return event;
  }

  getNextWeekendDate() {
    const today = new Date();
    const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
    const nextSaturday = new Date(today);
    nextSaturday.setDate(today.getDate() + daysUntilSaturday);
    nextSaturday.setHours(8, 0, 0, 0); // Default departure at 8 AM
    return nextSaturday;
  }
}

export default new CalendarService();