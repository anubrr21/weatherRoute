// frontend/src/pages/WeatherDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Droplet, Wind, Gauge, Sunrise, Sunset, Heart, Thermometer, CloudRain, Award } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

// Components
import CurrentWeather from '../components/weather/CurrentWeather';
import ForecastCard from '../components/weather/ForecastCard';
import WeatherChart from '../components/weather/WeatherChart';
import AirQuality from '../components/weather/AirQuality';
import InteractiveMap from '../components/map/InteractiveMap';

const WeatherDetails = () => {
  const { city } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { currentWeather, forecast, airQuality, loading, fetchWeatherData, addFavorite, removeFavorite, favorites } = useWeather();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Parse query parameters for lat/lon
  const queryParams = new URLSearchParams(location.search);
  const lat = queryParams.get('lat');
  const lon = queryParams.get('lon');

  // ========== NEW: Geocode city name to get coordinates ==========
  const geocodeCityAndFetchWeather = async (cityName) => {
    setIsGeocoding(true);
    try {
      // Use the existing searchCities function from weather context
      const response = await api.get('/weather/search', {
        params: { query: cityName }
      });
      
      if (response.data.data.cities && response.data.data.cities.length > 0) {
        const cityData = response.data.data.cities[0];
        const newLat = cityData.lat;
        const newLon = cityData.lon;
        
        // Update URL with coordinates (without refreshing)
        const newUrl = `/weather/${encodeURIComponent(cityName)}?lat=${newLat}&lon=${newLon}`;
        window.history.replaceState(null, '', newUrl);
        
        // Fetch weather with coordinates
        await fetchWeatherData(newLat, newLon, cityName);
      } else {
        toast.error(`City "${cityName}" not found`);
        navigate('/');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Could not find location coordinates');
      navigate('/');
    } finally {
      setIsGeocoding(false);
    }
  };

  // ========== MODIFIED: Handle both lat/lon and city name ==========
  useEffect(() => {
    if (lat && lon) {
      // Existing behavior: use coordinates from URL
      fetchWeatherData(lat, lon, city);
    } else if (city && !isGeocoding) {
      // NEW: No coordinates but city name exists - geocode it
      geocodeCityAndFetchWeather(city);
    } else if (!city) {
      // No city name either - error
      toast.error('Location not specified');
      navigate('/');
    }
  }, [lat, lon, city]);

  useEffect(() => {
    if (favorites && currentWeather && lat && lon) {
      setIsFavorite(favorites.some(f => 
        Math.abs(f.lat - parseFloat(lat)) < 0.01 && 
        Math.abs(f.lng - parseFloat(lon)) < 0.01
      ));
    }
  }, [favorites, currentWeather, lat, lon]);

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error('Please login to add favorites');
      navigate('/login');
      return;
    }

    if (!lat || !lon) {
      toast.error('Location coordinates not available');
      return;
    }

    if (isFavorite) {
      const fav = favorites.find(f => 
        Math.abs(f.lat - parseFloat(lat)) < 0.01 && 
        Math.abs(f.lng - parseFloat(lon)) < 0.01
      );
      if (fav) {
        await removeFavorite(fav._id);
        setIsFavorite(false);
      }
    } else {
      await addFavorite({
        locationName: city,
        lat: parseFloat(lat),
        lng: parseFloat(lon),
        country: currentWeather?.country || '',
      });
      setIsFavorite(true);
    }
  };

  // Show loading during geocoding
  if (loading || isGeocoding) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!currentWeather) {
    return (
      <div className="text-center py-20">
        <p className="text-xl text-gray-600 dark:text-gray-400">No weather data available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header with location and favorite button */}
      <div className="flex flex-wrap justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <MapPin className="w-8 h-8 text-primary-500" />
          <div>
            <h1 className="text-3xl font-bold dark:text-white">{currentWeather.city}</h1>
            <p className="text-gray-500 dark:text-gray-400">{currentWeather.country}</p>
          </div>
        </div>
        
        <button
          onClick={handleToggleFavorite}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            isFavorite 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-200 dark:bg-dark-300 hover:bg-gray-300 dark:hover:bg-dark-200'
          }`}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
          {isFavorite ? 'Favorited' : 'Add to Favorites'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main weather column */}
        <div className="lg:col-span-2 space-y-6">
          <CurrentWeather weather={currentWeather} />
          
          {/* Charts section */}
          {forecast && forecast.length > 0 && (
            <div className="weather-card p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Temperature Trend (5 Days)
              </h2>
              <WeatherChart forecast={forecast} />
            </div>
          )}
          
          {/* Forecast cards */}
          {forecast && forecast.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                5-Day Forecast
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {forecast.map((day, index) => (
                  <ForecastCard key={index} forecast={day} />
                ))}
              </div>
            </div>
          )}
          
          {/* Map - Only show if lat/lon available */}
          {lat && lon && (
            <div className="weather-card p-6">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Location Map</h2>
              <div className="h-96 rounded-lg overflow-hidden">
                <InteractiveMap 
                  center={[parseFloat(lat), parseFloat(lon)]} 
                  zoom={10}
                  marker={true}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Air Quality */}
          {airQuality && (
            <div className="weather-card p-6">
              <AirQuality data={airQuality} />
            </div>
          )}
          
          {/* Weather Details */}
          <div className="weather-card p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Weather Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-300">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Droplet className="w-4 h-4" />
                  Humidity
                </span>
                <span className="font-semibold dark:text-white">{currentWeather.humidity}%</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-300">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Wind className="w-4 h-4" />
                  Wind Speed
                </span>
                <span className="font-semibold dark:text-white">{currentWeather.windSpeed} m/s</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-300">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Gauge className="w-4 h-4" />
                  Pressure
                </span>
                <span className="font-semibold dark:text-white">{currentWeather.pressure} hPa</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-300">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <CloudRain className="w-4 h-4" />
                  Visibility
                </span>
                <span className="font-semibold dark:text-white">{currentWeather.visibility / 1000} km</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-dark-300">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Award className="w-4 h-4" />
                  Clouds
                </span>
                <span className="font-semibold dark:text-white">{currentWeather.clouds}%</span>
              </div>
            </div>
          </div>
          
          {/* Sunrise/Sunset */}
          <div className="weather-card p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Sun Schedule</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Sunrise className="w-4 h-4 text-yellow-500" />
                  Sunrise
                </span>
                <span className="font-semibold dark:text-white">
                  {new Date(currentWeather.sunrise * 1000).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Sunset className="w-4 h-4 text-orange-500" />
                  Sunset
                </span>
                <span className="font-semibold dark:text-white">
                  {new Date(currentWeather.sunset * 1000).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDetails;