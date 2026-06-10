// frontend/src/components/alerts/WeatherAlertBanner.jsx
import React from 'react';
import { AlertTriangle, X, Wind, CloudRain, CloudFog, Thermometer, MapPin } from 'lucide-react';
import { useAlerts } from '../../context/AlertContext';

const WeatherAlertBanner = () => {
  const { currentAlerts, showAlertBanner, setShowAlertBanner, dismissAlert } = useAlerts();
  
  if (!showAlertBanner || currentAlerts.length === 0) return null;
  
  const getAlertIcon = (type) => {
    switch(type) {
      case 'rain': return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'thunderstorm': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'fog': return <CloudFog className="w-5 h-5 text-gray-500" />;
      case 'heat': return <Thermometer className="w-5 h-5 text-orange-500" />;
      case 'cold': return <Thermometer className="w-5 h-5 text-blue-500" />;
      case 'wind': return <Wind className="w-5 h-5 text-cyan-500" />;
      default: return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };
  
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-50 dark:bg-red-900/20 border-red-500';
      case 'moderate': return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500';
      default: return 'bg-blue-50 dark:bg-blue-900/20 border-blue-500';
    }
  };
  
  return (
    <div className="weather-card p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold dark:text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          Weather Alerts ({currentAlerts.length})
        </h3>
        <button
          onClick={() => setShowAlertBanner(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="space-y-2">
        {currentAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded-lg border-l-4 ${getSeverityColor(alert.severity)} bg-opacity-50`}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2 flex-1">
                {getAlertIcon(alert.type)}
                <div>
                  <p className="font-medium dark:text-white text-sm">{alert.title}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {alert.message}
                  </p>
                  {alert.distance && (
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {alert.distance} km from start
                    </p>
                  )}
                  {alert.recommendation && (
                    <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                      💡 {alert.recommendation}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={() => dismissAlert(alert.id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeatherAlertBanner;