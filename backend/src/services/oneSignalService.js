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

  // ✅ ENHANCED: Smarter trip reminder with full details
  async sendTripReminder(userId, tripData) {
    const { 
      title, 
      startDateTime, 
      startLocation, 
      endLocation, 
      tripId,
      distance,
      duration,
      weatherCondition,
      weatherTemp,
      weatherDescription
    } = tripData;
    
    const date = new Date(startDateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    // Build smart notification message
    const emoji = weatherCondition === 'Rain' ? '🌧️' : 
                  weatherCondition === 'Clear' ? '☀️' : 
                  weatherCondition === 'Clouds' ? '⛅' : '🌤️';
    
    const weatherText = weatherTemp ? `${emoji} ${weatherTemp}°C, ${weatherCondition || 'Clear'}` : '';
    const distanceText = distance ? `📏 ${distance}` : '';
    const durationText = duration ? `⏱️ ${duration}` : '';
    
    // Build detailed message
    let message = `📍 ${startLocation} → ${endLocation}\n`;
    message += `📅 ${date}\n`;
    if (weatherText) message += `${weatherText}\n`;
    if (distanceText) message += `${distanceText}`;
    if (distanceText && durationText) message += ` • `;
    if (durationText) message += `${durationText}`;

    // Enhanced data payload for route loading
    const dataPayload = {
      url: `https://weatherroute-frontend-9y5l.onrender.com/route-planner`,
      tripId: tripId,
      type: 'trip_reminder',
      startLocation: startLocation,
      endLocation: endLocation,
      date: startDateTime,
      title: title,
      distance: distance || '',
      duration: duration || '',
      weatherCondition: weatherCondition || '',
      weatherTemp: weatherTemp || '',
      loadRoute: 'true',  // ✅ Flag to auto-load route
      action: 'view_route' // ✅ Action type
    };

    // Enhanced title with emoji
    const enhancedTitle = `🚗 Trip Reminder: ${title}`;

    return this.sendNotificationToUser(
      userId,
      enhancedTitle,
      message,
      dataPayload,
      {
        // Additional options for better notification
        ios_attachments: {
          id: 'https://weatherroute-frontend-9y5l.onrender.com/notification-icon.png'
        },
        android_channel_id: 'trip_reminders'
      }
    );
  }

  async sendWeatherAlert(userId, alertData) {
    const { city, condition, temperature, severity } = alertData;
    const emoji = severity === 'high' ? '⚠️' : '🌤️';

    const dataPayload = {
      url: `https://weatherroute-frontend-9y5l.onrender.com/weather/${encodeURIComponent(city)}`,
      type: 'weather_alert',
      city: city,
      condition: condition,
      severity: severity,
      action: 'view_weather'
    };

    return this.sendNotificationToUser(
      userId,
      `${emoji} Weather Alert: ${city}`,
      `${condition} expected with ${temperature}°C. ${severity === 'high' ? 'Take precautions!' : 'Plan accordingly.'}`,
      dataPayload
    );
  }

  async sendPromotionalNotification(userId, title, message, url = '/dashboard') {
    return this.sendNotificationToUser(
      userId,
      title,
      message,
      {
        url: `https://weatherroute-frontend-9y5l.onrender.com${url}`,
        type: 'promotional',
        action: 'view_promo'
      }
    );
  }

  async sendBulkNotification(userIds, title, message, data = {}) {
    if (!this.appId || !this.apiKey) {
      console.log('⚠️ OneSignal not configured');
      return false;
    }

    try {
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