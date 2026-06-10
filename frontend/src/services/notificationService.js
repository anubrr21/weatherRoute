// frontend/src/services/notificationService.js
import api from './api';

class NotificationService {
  constructor() {
    this.swRegistration = null;
    this.vapidPublicKey = null;
  }

  async init() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return false;
    }
    
    try {
      // Get VAPID public key from backend
      const response = await api.get('/alerts/vapid-key');
      this.vapidPublicKey = response.data.data.publicKey;
      
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
      
      return true;
    } catch (error) {
      console.error('Notification init error:', error);
      return false;
    }
  }

  async subscribeToPush() {
    if (!this.swRegistration || !this.vapidPublicKey) {
      await this.init();
    }
    
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }
      
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });
      
      // Save subscription to backend
      await api.post('/alerts/subscribe', { subscription });
      console.log('Push subscription saved');
      return true;
    } catch (error) {
      console.error('Push subscription error:', error);
      return false;
    }
  }

  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async updatePreferences(preferences) {
    const response = await api.put('/alerts/preferences', preferences);
    return response.data.data.preferences;
  }

  async getRouteAlerts(routeData, weatherData, startLocation, endLocation) {
    const response = await api.post('/alerts/route', {
      routeData,
      weatherData,
      startLocation,
      endLocation
    });
    return response.data.data.alerts;
  }
}

export default new NotificationService();