// frontend/src/context/AlertContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import notificationService from '../services/notificationService';
import { useAuth } from './AuthContext';

const AlertContext = createContext();

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within AlertProvider');
  }
  return context;
};

export const AlertProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [currentAlerts, setCurrentAlerts] = useState([]);
  const [showAlertBanner, setShowAlertBanner] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [alertPreferences, setAlertPreferences] = useState({
    notifications: true,
    alertTypes: {
      rain: true,
      storms: true,
      fog: true,
      extremeTemp: true,
      wind: true
    }
  });

  // Initialize notifications on login
  useEffect(() => {
    if (isAuthenticated) {
      notificationService.init().then(() => {
        // Check if already subscribed
        if (Notification.permission === 'granted') {
          setNotificationsEnabled(true);
        }
      });
    }
  }, [isAuthenticated]);

  const enableNotifications = async () => {
    const success = await notificationService.subscribeToPush();
    setNotificationsEnabled(success);
    return success;
  };

  const loadRouteAlerts = async (routeData, weatherData, startLocation, endLocation) => {
    if (!routeData || !weatherData) return [];
    
    const alerts = await notificationService.getRouteAlerts(
      routeData,
      weatherData,
      startLocation,
      endLocation
    );
    
    setCurrentAlerts(alerts);
    
    // Send push notification for high severity alerts if enabled
    if (notificationsEnabled) {
      const highSeverityAlerts = alerts.filter(a => a.severity === 'high');
      for (const alert of highSeverityAlerts) {
        // Push notifications are sent from backend, so just log here
        console.log('High severity alert:', alert.title);
      }
    }
    
    return alerts;
  };

  const updatePreferences = async (preferences) => {
    const updated = await notificationService.updatePreferences(preferences);
    setAlertPreferences(updated);
  };

  const dismissAlert = (alertId) => {
    setCurrentAlerts(prev => prev.filter(a => a.id !== alertId));
  };

  const dismissAllAlerts = () => {
    setCurrentAlerts([]);
  };

  const value = {
    currentAlerts,
    showAlertBanner,
    notificationsEnabled,
    alertPreferences,
    enableNotifications,
    loadRouteAlerts,
    updatePreferences,
    dismissAlert,
    dismissAllAlerts,
    setShowAlertBanner
  };

  return (
    <AlertContext.Provider value={value}>
      {children}
    </AlertContext.Provider>
  );
};