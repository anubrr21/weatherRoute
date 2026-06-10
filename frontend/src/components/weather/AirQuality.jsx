// frontend/src/components/weather/AirQuality.jsx
import React from 'react';
import { Award, Wind, Droplet, AlertTriangle } from 'lucide-react';

const AirQuality = ({ data }) => {
  const getAQIColor = (aqi) => {
    switch(aqi) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-orange-500';
      case 4: return 'bg-red-500';
      case 5: return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getAQIText = (aqi) => {
    switch(aqi) {
      case 1: return 'Good';
      case 2: return 'Fair';
      case 3: return 'Moderate';
      case 4: return 'Poor';
      case 5: return 'Very Poor';
      default: return 'Unknown';
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
        <Award className="w-5 h-5" />
        Air Quality Index
      </h2>
      
      <div className="text-center mb-4">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getAQIColor(data.aqi)} text-white text-3xl font-bold mb-2`}>
          {data.aqi}
        </div>
        <div className="text-lg font-semibold dark:text-white">
          {getAQIText(data.aqi)}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          {data.healthRecommendation}
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="font-semibold dark:text-white">Pollutants (μg/m³)</h3>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Wind className="w-4 h-4" />
              PM2.5
            </span>
            <span className="font-semibold dark:text-white">{data.components.pm2_5}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Wind className="w-4 h-4" />
              PM10
            </span>
            <span className="font-semibold dark:text-white">{data.components.pm10}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <Droplet className="w-4 h-4" />
              NO₂
            </span>
            <span className="font-semibold dark:text-white">{data.components.no2}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <AlertTriangle className="w-4 h-4" />
              O₃
            </span>
            <span className="font-semibold dark:text-white">{data.components.o3}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQuality;