// frontend/public/sw.js
self.addEventListener('push', function(event) {
  const data = event.data.json();
  
  const options = {
    body: data.body,
    icon: data.icon || '/notification-icon.png',
    badge: data.badge || '/badge.png',
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data || {},
    actions: [
      { action: 'view_route', title: 'View Route' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    tag: data.tag || 'weatherroute-notification',
    renotify: true,
    requireInteraction: true
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'WeatherRoute', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  
  if (event.action === 'view_route' || !event.action) {
    // Send message to client to handle navigation
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Send message to all clients
          clientList.forEach(function(client) {
            client.postMessage({
              type: 'notification_click',
              data: notificationData
            });
          });
          
          // If no clients, open new window
          if (clientList.length === 0) {
            if (clients.openWindow) {
              // If it's a trip reminder, go to route planner with data
              if (notificationData.type === 'trip_reminder' && notificationData.loadRoute === 'true') {
                const url = `/route-planner?start=${encodeURIComponent(notificationData.startLocation)}&end=${encodeURIComponent(notificationData.endLocation)}&autoPlan=true`;
                return clients.openWindow(url);
              }
              return clients.openWindow('/dashboard');
            }
          }
        })
    );
  }
});

self.addEventListener('install', function(event) {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});