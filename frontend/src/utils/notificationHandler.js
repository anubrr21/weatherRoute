// frontend/src/utils/notificationHandler.js

/**
 * Handle notification click and route loading
 * This function is called when a user clicks a notification
 */
export const handleNotificationClick = (notificationData) => {
  const { data } = notificationData;
  
  if (data.type === 'trip_reminder' && data.loadRoute === 'true') {
    // Store route data in sessionStorage
    sessionStorage.setItem('notificationRouteData', JSON.stringify({
      startLocation: data.startLocation,
      endLocation: data.endLocation,
      title: data.title,
      date: data.date,
      loadRoute: 'true',
      fromNotification: 'true'
    }));
    
    // Navigate to route planner
    window.location.href = '/route-planner';
  } else if (data.type === 'weather_alert') {
    // Navigate to weather page
    window.location.href = `/weather/${encodeURIComponent(data.city)}`;
  } else {
    // Default: go to dashboard
    window.location.href = '/dashboard';
  }
};

// Service worker message listener
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'notification_click') {
      handleNotificationClick(event.data);
    }
  });
}