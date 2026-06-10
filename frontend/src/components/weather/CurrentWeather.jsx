// frontend/src/components/weather/CurrentWeather.jsx
import React from 'react';
import { Thermometer, Cloud, MapPin } from 'lucide-react';

const CurrentWeather = ({ weather }) => {
  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@4x.png`;
  };

  return (
    <div className="weather-card p-6 bg-gradient-to-br from-primary-50 to-white dark:from-dark-200 dark:to-dark-300">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-primary-500" />
            <h2 className="text-2xl font-semibold dark:text-white">{weather.city}</h2>
          </div>
          <div className="text-6xl font-bold dark:text-white mb-2">
            {weather.temp}°C
          </div>
          <div className="text-gray-500 dark:text-gray-400 mb-2">
            Feels like {weather.feelsLike}°C
          </div>
          <div className="text-gray-600 dark:text-gray-300 capitalize">
            {weather.description}
          </div>
        </div>
        
        <div className="text-center">
          <img 
            src={getWeatherIconUrl(weather.icon)} 
            alt={weather.condition}
            className="w-32 h-32 animate-float"
          />
          <div className="text-lg font-semibold dark:text-white">
            {weather.condition}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">High/Low</div>
            <div className="text-lg font-semibold dark:text-white">--/--</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Humidity</div>
            <div className="text-lg font-semibold dark:text-white">{weather.humidity}%</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Wind</div>
            <div className="text-lg font-semibold dark:text-white">{weather.windSpeed} m/s</div>
          </div>
          <div>
            <div className="text-gray-500 dark:text-gray-400 text-sm">Pressure</div>
            <div className="text-lg font-semibold dark:text-white">{weather.pressure} hPa</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentWeather;