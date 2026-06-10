// backend/src/services/pushService.js
import webpush from 'web-push';

class PushService {
  constructor() {
    this.vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
    this.vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    this.vapidSubject = process.env.VAPID_SUBJECT;
    
    if (this.vapidPublicKey && this.vapidPrivateKey) {
      webpush.setVapidDetails(
        this.vapidSubject,
        this.vapidPublicKey,
        this.vapidPrivateKey
      );
      console.log('✅ Push notification service initialized');
    } else {
      console.log('⚠️ Push notification not configured');
    }
  }

  async sendNotification(subscription, title, body, data = {}) {
    if (!this.vapidPublicKey) {
      console.log('Push notifications not configured');
      return false;
    }
    
    const payload = JSON.stringify({
      title,
      body,
      icon: '/weather-icon.png',
      badge: '/badge.png',
      data,
      vibrate: [200, 100, 200],
      actions: [
        { action: 'view', title: 'View Route' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    });
    
    try {
      await webpush.sendNotification(subscription, payload);
      return true;
    } catch (error) {
      console.error('Push notification error:', error);
      return false;
    }
  }

  getVapidPublicKey() {
    return this.vapidPublicKey;
  }
}

export default new PushService();