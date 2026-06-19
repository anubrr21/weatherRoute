// frontend/src/components/notifications/NotificationPrompt.jsx
import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock } from 'lucide-react';
import oneSignalService from '../../services/oneSignalService';
import toast from 'react-hot-toast';

const NotificationPrompt = () => {
  const [visible, setVisible] = useState(false);
  const [permission, setPermission] = useState('default');
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(localStorage.getItem('notificationPromptDismissed') === 'true');

  useEffect(() => {
    const checkPermission = async () => {
      const status = oneSignalService.getPermissionStatus();
      setPermission(status);
      
      if (status === 'default' && !dismissed) {
        // Initialize OneSignal
        await oneSignalService.init();
        const timer = setTimeout(() => setVisible(true), 3000);
        return () => clearTimeout(timer);
      }
    };
    
    checkPermission();
  }, [dismissed]);

  const handleAllow = async () => {
    setLoading(true);
    try {
      const success = await oneSignalService.requestPermission();
      if (success) {
        setVisible(false);
        setPermission('granted');
        toast.success('✅ Notifications enabled! You\'ll get updates about your trips.');
      } else {
        toast.error('Failed to enable notifications');
      }
    } catch (error) {
      console.error('Allow notifications error:', error);
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleLater = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem('notificationPromptDismissed', 'true');
    toast('You can enable notifications later from settings');
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
    localStorage.setItem('notificationPromptDismissed', 'true');
  };

  if (!visible || permission === 'granted' || permission === 'denied') {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md animate-slide-up">
      <div className="bg-white dark:bg-dark-200 rounded-xl shadow-2xl p-4 border border-gray-200 dark:border-dark-300">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-500" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm dark:text-white">Stay Updated with Trip Alerts</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Get notified about your upcoming trips, weather changes, and travel recommendations.
            </p>
            
            <div className="flex flex-wrap gap-2 mt-3">
              <button
                onClick={handleAllow}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Check className="w-3 h-3" />
                    Allow
                  </>
                )}
              </button>
              <button
                onClick={handleLater}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 dark:bg-dark-300 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-300 dark:hover:bg-dark-400 transition-colors"
              >
                <Clock className="w-3 h-3" />
                Later
              </button>
            </div>
          </div>
          
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-dark-300 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPrompt;