// frontend/src/services/oneSignalService.js
import api from './api';

class OneSignalService {
  constructor() {
    this.isInitialized = false;
    this.playerId = null;
  }

  async init() {
    if (this.isInitialized) return true;
    
    try {
      // Check if OneSignal is loaded
      if (typeof window.OneSignal === 'undefined') {
        console.log('OneSignal not loaded yet, waiting...');
        await this.waitForOneSignal();
      }

      // Initialize OneSignal
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        await OneSignal.init({
          appId: import.meta.env.VITE_ONESIGNAL_APP_ID,
          safari_web_id: import.meta.env.VITE_ONESIGNAL_SAFARI_WEB_ID,
          notifyButton: {
            enable: false,
          },
          allowLocalhostAsSecureOrigin: true,
        });
      });

      // Get player ID
      const playerId = await this.getPlayerId();
      if (playerId) {
        this.playerId = playerId;
        // Register with backend
        await api.post('/notifications/subscribe', { playerId });
      }

      this.isInitialized = true;
      console.log('✅ OneSignal initialized');
      return true;
    } catch (error) {
      console.error('OneSignal init error:', error);
      return false;
    }
  }

  async waitForOneSignal() {
    return new Promise((resolve) => {
      const check = () => {
        if (typeof window.OneSignal !== 'undefined') {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      };
      check();
    });
  }

  async getPlayerId() {
    return new Promise((resolve) => {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function(OneSignal) {
        const id = await OneSignal.getUserId();
        resolve(id);
      });
    });
  }

  async requestPermission() {
    try {
      await this.init();
      
      return new Promise((resolve) => {
        window.OneSignalDeferred = window.OneSignalDeferred || [];
        window.OneSignalDeferred.push(async function(OneSignal) {
          const permission = await OneSignal.showSlidedownPrompt({
            force: true
          });
          resolve(permission);
        });
      });
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  async sendTestNotification(title, body) {
    try {
      await api.post('/notifications/test', { title, body });
      return true;
    } catch (error) {
      console.error('Test notification error:', error);
      return false;
    }
  }

  async unsubscribe() {
    try {
      await api.delete('/notifications/unsubscribe');
      this.playerId = null;
      return true;
    } catch (error) {
      console.error('Unsubscribe error:', error);
      return false;
    }
  }

  getPermissionStatus() {
    return Notification.permission;
  }
}

export default new OneSignalService();