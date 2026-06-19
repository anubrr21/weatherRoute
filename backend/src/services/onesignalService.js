// backend/src/services/oneSignalService.js
import axios from 'axios';

class OneSignalService {
  constructor() {
    this.appId = process.env.ONESIGNAL_APP_ID;
    this.apiKey = process.env.ONESIGNAL_API_KEY;
    this.userAuthKey = process.env.ONESIGNAL_USER_AUTH_KEY;
    this.baseUrl = 'https://onesignal.com/api/v1';
    
    if (this.appId && this.apiKey) {
      console.log('✅ OneSignal service initialized');
    } else {
      console.warn('⚠️ OneSignal keys not configured');
    }
  }

  async sendNotificationToUser(userId, title, message, data = {}, options = {}) {
    if (!this.appId || !this.apiKey) {
      console.log('⚠️ OneSignal not configured');
      return false;
    }

    try {
      // Get user's OneSignal player ID
      const playerId = await this.getUserPlayerId(userId);
      
      if (!playerId) {
        console.log(`No player ID for user ${userId}`);
        return false;
      }

      const payload = {
        app_id: this.appId,
        include_player_ids: [playerId],
        headings: { en: title },
        contents: { en: message },
        data: data,
        url: data.url || 'https://weatherroute-frontend-9y5l.onrender.com',
        chrome_web_icon: 'https://weatherroute-frontend-9y5l.onrender.com/notification-icon.png',
        android_sound: 'default',
        ios_sound: 'default',
        ...options
      };

      // Add delivery timing if specified
      if (options.delayedDelivery) {
        payload.send_after = options.delayedDelivery;
      }

      const response = await axios.post(`${this.baseUrl}/notifications`, payload, {
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ OneSignal notification sent: ${title}`);
      return response.data;
      
    } catch (error) {
      console.error('OneSignal error:', error.response?.data || error.message);
      return false;
    }
  }

  async sendTripReminder(userId, tripData) {
    const { title, startDateTime, startLocation, endLocation, tripId } = tripData;
    const date = new Date(startDateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    return this.sendNotificationToUser(
      userId,
      `🚗 Trip Reminder: ${title}`,
      `Your trip from ${startLocation} to ${endLocation} is scheduled for ${date}. Plan your route now!`,
      {
        url: `https://weatherroute-frontend-9y5l.onrender.com/route-planner?trip=${encodeURIComponent(tripId)}`,
        tripId: tripId,
        type: 'trip_reminder',
        startLocation: startLocation,
        endLocation: endLocation,
        date: startDateTime
      }
    );
  }

  async sendWeatherAlert(userId, alertData) {
    const { city, condition, temperature, severity } = alertData;
    const emoji = severity === 'high' ? '⚠️' : '🌤️';

    return this.sendNotificationToUser(
      userId,
      `${emoji} Weather Alert: ${city}`,
      `${condition} expected with ${temperature}°C. ${severity === 'high' ? 'Take precautions!' : 'Plan accordingly.'}`,
      {
        url: `https://weatherroute-frontend-9y5l.onrender.com/weather/${encodeURIComponent(city)}`,
        type: 'weather_alert',
        city: city,
        condition: condition,
        severity: severity
      }
    );
  }

  async sendPromotionalNotification(userId, title, message, url = '/dashboard') {
    return this.sendNotificationToUser(
      userId,
      title,
      message,
      {
        url: `https://weatherroute-frontend-9y5l.onrender.com${url}`,
        type: 'promotional'
      }
    );
  }

  async sendBulkNotification(userIds, title, message, data = {}) {
    if (!this.appId || !this.apiKey) {
      console.log('⚠️ OneSignal not configured');
      return false;
    }

    try {
      // Get all player IDs for users
      const playerIds = [];
      for (const userId of userIds) {
        const playerId = await this.getUserPlayerId(userId);
        if (playerId) playerIds.push(playerId);
      }

      if (playerIds.length === 0) {
        console.log('No player IDs found');
        return false;
      }

      const payload = {
        app_id: this.appId,
        include_player_ids: playerIds,
        headings: { en: title },
        contents: { en: message },
        data: data,
        url: data.url || 'https://weatherroute-frontend-9y5l.onrender.com'
      };

      const response = await axios.post(`${this.baseUrl}/notifications`, payload, {
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Bulk notification sent to ${playerIds.length} users`);
      return response.data;
      
    } catch (error) {
      console.error('Bulk notification error:', error.response?.data || error.message);
      return false;
    }
  }

  async registerPlayerId(userId, playerId) {
    try {
      // Store player ID in user document
      await axios.put(`${this.baseUrl}/players/${playerId}`, {
        app_id: this.appId,
        tags: { userId: userId.toString() }
      }, {
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log(`✅ Player ID registered for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Register player error:', error.message);
      return false;
    }
  }

  async getUserPlayerId(userId) {
    // In production, you would store this in database
    // For now, we'll use the stored subscription in User model
    // You can also query OneSignal player by external_id
    try {
      const response = await axios.get(`${this.baseUrl}/players`, {
        params: {
          app_id: this.appId,
          external_id: userId.toString()
        },
        headers: {
          'Authorization': `Basic ${this.apiKey}`
        }
      });
      
      if (response.data && response.data.players && response.data.players.length > 0) {
        return response.data.players[0].id;
      }
      return null;
    } catch (error) {
      console.error('Get player error:', error.message);
      return null;
    }
  }

  async scheduleNotification(userId, title, message, scheduleTime, data = {}) {
    return this.sendNotificationToUser(
      userId,
      title,
      message,
      data,
      { delayedDelivery: scheduleTime.toISOString() }
    );
  }
}

export default new OneSignalService();





