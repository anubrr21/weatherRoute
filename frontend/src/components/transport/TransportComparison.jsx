// frontend/src/components/transport/TransportComparison.jsx
import React from 'react';
import { Car, Train, Plane, TrendingUp, Shield, Clock, AlertTriangle } from 'lucide-react';

const TransportComparison = ({ roadData, trainData, flightData, weatherImpact, recommendation }) => {
  const modes = [
    {
      name: 'Road',
      icon: <Car className="w-5 h-5" />,
      color: 'text-green-600',
      bg: 'bg-green-100 dark:bg-green-900/30',
      data: roadData,
      risk: weatherImpact?.impacts?.road?.risk || 'low',
      message: weatherImpact?.impacts?.road?.message || 'Normal conditions'
    },
    {
      name: 'Train',
      icon: <Train className="w-5 h-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      data: trainData,
      risk: weatherImpact?.impacts?.train?.risk || 'low',
      message: weatherImpact?.impacts?.train?.message || 'Normal operations'
    },
    {
      name: 'Flight',
      icon: <Plane className="w-5 h-5" />,
      color: 'text-purple-600',
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      data: flightData,
      risk: weatherImpact?.impacts?.flight?.risk || 'low',
      message: weatherImpact?.impacts?.flight?.message || 'Normal operations'
    }
  ];
  
  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'text-green-600 bg-green-100 dark:bg-green-900/30';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30';
      case 'high': return 'text-red-600 bg-red-100 dark:bg-red-900/30';
      default: return 'text-gray-600 bg-gray-100';
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
  
  return (
    <div className="weather-card p-6 mb-6">
      <h2 className="text-xl font-semibold dark:text-white mb-4 flex items-center gap-2">
        <TrendingUp className="w-5 h-5 text-primary-500" />
        AI Travel Comparison
      </h2>
      
      {/* Recommendation Card */}
      {recommendation && (
        <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="text-3xl">
              {recommendation.bestMode === 'road' && '🚗'}
              {recommendation.bestMode === 'train' && '🚆'}
              {recommendation.bestMode === 'flight' && '✈️'}
            </div>
            <div>
              <p className="font-bold text-lg dark:text-white">
                WISE Recommends: {recommendation.bestMode === 'road' ? 'Road Travel' : 
                                 recommendation.bestMode === 'train' ? 'Train Travel' : 'Flight Travel'}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">{recommendation.reason}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Weather Impact Summary */}
      {weatherImpact && (
        <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-300 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-500" />
            <span className="font-medium dark:text-white">Weather Impact Analysis</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {weatherImpact.condition} at destination ({weatherImpact.temperature}°C)
          </p>
        </div>
      )}
      
      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modes.map((mode, idx) => (
          <div key={idx} className="p-4 bg-gray-50 dark:bg-dark-300 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-2 rounded-full ${mode.bg}`}>
                {mode.icon}
              </div>
              <span className="font-semibold dark:text-white">{mode.name}</span>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${getRiskColor(mode.risk)}`}>
                {getRiskIcon(mode.risk)} {mode.risk.toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Weather Risk:</span>
                <span className="font-medium dark:text-white capitalize">{mode.risk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Status:</span>
                <span className="font-medium dark:text-white">{mode.message}</span>
              </div>
              
              {mode.name === 'Train' && mode.data?.trains?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-dark-400">
                  <p className="text-xs text-gray-500">{mode.data.trains.length} trains available</p>
                  <p className="text-xs text-gray-500">Fastest: {mode.data.trains[0]?.duration}</p>
                </div>
              )}
              
              {mode.name === 'Flight' && mode.data?.flights?.length > 0 && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-dark-400">
                  <p className="text-xs text-gray-500">{mode.data.flights.length} flights available</p>
                  <p className="text-xs text-gray-500">From ₹{mode.data.flights[0]?.price?.toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransportComparison;