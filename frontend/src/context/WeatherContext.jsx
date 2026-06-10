// frontend/src/context/WeatherContext.jsx
import React, { createContext, useState, useContext, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';
import { useHistory } from './HistoryContext';

const WeatherContext = createContext();

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (!context) {
    throw new Error('useWeather must be used within WeatherProvider');
  }
  return context;
};

export const WeatherProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { addSearch } = useHistory();
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);
  
  // Track ongoing search to prevent duplicates
  const ongoingSearchRef = useRef(null);

  const fetchWeatherData = async (lat, lon, locationName = '') => {
    // Prevent duplicate concurrent searches for same location
    const searchKey = `${lat},${lon},${locationName}`;
    if (ongoingSearchRef.current === searchKey) {
      console.log('Duplicate search prevented');
      return null;
    }
    
    ongoingSearchRef.current = searchKey;
    setLoading(true);
    
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/weather/all`, {
        params: { lat, lon, locationName }
      });
      
      const { current, forecast, airQuality } = response.data.data;
      setCurrentWeather(current);
      setForecast(forecast);
      setAirQuality(airQuality);
      
      // Save to search history if user is authenticated and location name provided
      if (isAuthenticated && locationName && locationName.trim() !== '') {
        await addSearch({
          city: locationName,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          country: current?.country || '',
          temperature: current?.temp,
          weatherCondition: current?.condition
        });
      }
      
      ongoingSearchRef.current = null;
      return { current, forecast, airQuality };
    } catch (error) {
      console.error('Weather fetch error:', error);
      toast.error('Failed to fetch weather data');
      ongoingSearchRef.current = null;
      return null;
    } finally {
      setLoading(false);
    }
  };

  const searchCities = async (query) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/weather/search`, {
        params: { query }
      });
      return response.data.data.cities;
    } catch (error) {
      console.error('City search error:', error);
      return [];
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/favorites`);
      setFavorites(response.data.data.favorites);
      return response.data.data.favorites;
    } catch (error) {
      console.error('Fetch favorites error:', error);
      return [];
    }
  };

  const addFavorite = async (locationData) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/user/favorites`, locationData);
      setFavorites(prev => [response.data.data.favorite, ...prev]);
      toast.success('Added to favorites! ⭐');
      return response.data.data.favorite;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add favorite');
      return null;
    }
  };

  const removeFavorite = async (id) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/user/favorites/${id}`);
      setFavorites(prev => prev.filter(f => f._id !== id));
      toast.success('Removed from favorites');
      return true;
    } catch (error) {
      toast.error('Failed to remove favorite');
      return false;
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/user/history`);
      setSearchHistory(response.data.data.history);
      return response.data.data.history;
    } catch (error) {
      console.error('Fetch history error:', error);
      return [];
    }
  };

  const value = {
    currentWeather,
    forecast,
    airQuality,
    loading,
    searchHistory,
    favorites,
    fetchWeatherData,
    searchCities,
    fetchFavorites,
    addFavorite,
    removeFavorite,
    fetchSearchHistory
  };

  return (
    <WeatherContext.Provider value={value}>
      {children}
    </WeatherContext.Provider>
  );
};