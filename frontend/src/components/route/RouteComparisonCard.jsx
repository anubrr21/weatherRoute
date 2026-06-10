// frontend/src/components/route/RouteComparisonCard.jsx
import React from 'react';
import { Clock, Ruler, Shield, Navigation, CheckCircle } from 'lucide-react';

const RouteComparisonCard = ({ route, isSelected, onSelect, index }) => {
  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const getRiskIcon = (risk) => {
    switch(risk) {
      case 'low': return '✅';
      case 'moderate': return '⚠️';
      case 'high': return '🚨';
      default: return 'ℹ️';
    }
  };

  const formatDistance = (distance) => {
    if (!distance) return 'N/A';
    return distance.text || `${(distance.meters / 1000).toFixed(1)} km`;
  };

  const formatDuration = (duration) => {
    if (!duration) return 'N/A';
    return duration.text || `${Math.round(duration.minutes)} min`;
  };

  return (
    <div 
      onClick={onSelect}
      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
        isSelected 
          ? 'bg-primary-50 dark:bg-primary-900/30 border-2 border-primary-500 shadow-lg' 
          : 'bg-gray-50 dark:bg-dark-300 border-2 border-transparent hover:border-primary-300'
      }`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          {isSelected && <CheckCircle className="w-5 h-5 text-primary-500" />}
          <h3 className="font-semibold dark:text-white">{route.name}</h3>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(route.weatherRisk)}`}>
          {getRiskIcon(route.weatherRisk)} {route.weatherRisk?.toUpperCase() || 'UNKNOWN'} RISK
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="flex items-center gap-2 text-sm">
          <Ruler className="w-4 h-4 text-gray-400" />
          <span className="dark:text-gray-300">{formatDistance(route.distance)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="dark:text-gray-300">{formatDuration(route.duration)}</span>
        </div>
      </div>
      
      {route.weatherSummary && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-dark-400">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Shield className="w-3 h-3" />
            <span>Weather: {route.weatherSummary.primaryCondition} • {route.weatherSummary.averageTemperature}°C avg</span>
          </div>
        </div>
      )}
      
      {isSelected && (
        <div className="mt-3 text-xs text-primary-600 dark:text-primary-400">
          Currently selected route
        </div>
      )}
    </div>
  );
};

export default RouteComparisonCard;