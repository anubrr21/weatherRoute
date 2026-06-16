// frontend/src/services/calendarService.js
import api from './api';

class CalendarService {
  async getEvents(start, end) {
    const response = await api.get('/calendar', {
      params: { start, end }
    });
    return response.data.data.events;
  }

  async createEvent(eventData) {
    const response = await api.post('/calendar', eventData);
    return response.data.data.event;
  }

  async updateEvent(id, eventData) {
    const response = await api.put(`/calendar/${id}`, eventData);
    return response.data.data.event;
  }

  async deleteEvent(id) {
    await api.delete(`/calendar/${id}`);
  }

  async createRegularTripEvent(tripName) {
    const response = await api.post('/calendar/regular-trip', { tripName });
    return response.data.data.event;
  }

  async registerPushDevice(playerId) {
    await api.post('/calendar/register-device', { playerId });
  }
}

export default new CalendarService();