// frontend/src/components/weather/ForecastCard.jsx
import React from 'react';
import { CloudRain, Thermometer, Wind } from 'lucide-react';

const ForecastCard = ({ forecast }) => {
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  };

  return (
    <div className="weather-card p-4 text-center hover:transform hover:scale-105 transition-all duration-300">
      <div className="font-semibold text-lg dark:text-white mb-2">
        {forecast.day}
      </div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {forecast.date}
      </div>
      <img 
        src={getWeatherIconUrl(forecast.icon)} 
        alt={forecast.condition}
        className="w-16 h-16 mx-auto mb-2"
      />
      <div className="text-2xl font-bold dark:text-white mb-1">
        {Math.round(forecast.tempAvg)}°C
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-300 capitalize mb-3">
        {forecast.condition}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Thermometer className="w-3 h-3" />
            <span>↑{Math.round(forecast.tempHigh)}° ↓{Math.round(forecast.tempLow)}°</span>
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
            <Wind className="w-3 h-3" />
            <span>{forecast.windSpeed} m/s</span>
          </span>
        </div>
        {forecast.rainProbability > 0 && (
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1 text-blue-500">
              <CloudRain className="w-3 h-3" />
              <span>{forecast.rainProbability}% rain</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastCard;