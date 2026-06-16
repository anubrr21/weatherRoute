// backend/src/services/onesignalService.js
import axios from 'axios';

class OneSignalService {
  constructor() {
    this.appId = process.env.ONESIGNAL_APP_ID;
    this.apiKey = process.env.ONESIGNAL_API_KEY;
    this.userAuthKey = process.env.ONESIGNAL_USER_AUTH_KEY;
    this.baseUrl = 'https://onesignal.com/api/v1';
    this.playerIds = new Map(); // Store user's device player IDs
  }

  async sendNotificationToUser(userId, title, message, data = {}) {
    const playerId = this.playerIds.get(userId.toString());
    
    if (!playerId) {
      console.log(`No player ID for user ${userId}, notification not sent`);
      return false;
    }
    
    try {
      const response = await axios.post(`${this.baseUrl}/notifications`, {
        app_id: this.appId,
        include_player_ids: [playerId],
        headings: { en: title },
        contents: { en: message },
        data: data,
        chrome_web_icon: 'https://yourdomain.com/icon.png',
        priority: 10
      }, {
        headers: {
          'Authorization': `Basic ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('OneSignal notification sent:', response.data);
      return true;
    } catch (error) {
      console.error('OneSignal error:', error.response?.data || error.message);
      return false;
    }
  }

  registerPlayerId(userId, playerId) {
    this.playerIds.set(userId.toString(), playerId);
    console.log(`Player ID registered for user ${userId}`);
  }

  unregisterPlayerId(userId) {
    this.playerIds.delete(userId.toString());
  }
}

export default new OneSignalService();