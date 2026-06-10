// frontend/src/pages/SearchHistory.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Trash2, Clock, MapPin, ChevronRight } from 'lucide-react';
import { useHistory } from '../context/HistoryContext';
import toast from 'react-hot-toast';

const SearchHistory = () => {
  const navigate = useNavigate();
  const { searchHistory, clearSearches, reloadHistory } = useHistory();
  const [deleting, setDeleting] = useState(false);

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      setDeleting(true);
      await clearSearches();
      toast.success('Search history cleared');
      setDeleting(false);
    }
  };

  const handleSearchAgain = (city, lat, lon) => {
    navigate(`/weather/${encodeURIComponent(city)}?lat=${lat}&lon=${lon}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Drizzle': '🌦️',
      'Mist': '🌫️'
    };
    return icons[condition] || '🌤️';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Search History</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {searchHistory.length} {searchHistory.length === 1 ? 'search' : 'searches'} recorded
          </p>
        </div>
        {searchHistory.length > 0 && (
          <button
            onClick={handleClearAll}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      {searchHistory.length === 0 ? (
        <div className="weather-card p-12 text-center">
          <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold dark:text-white mb-2">No search history yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start searching for cities to see your history here
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Search Weather
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {searchHistory.map((item, index) => (
            <div
              key={item._id || index}
              className="weather-card p-4 hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleSearchAgain(item.city, item.lat, item.lon)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-3xl">
                    {getWeatherIcon(item.weatherCondition)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold dark:text-white">
                        {item.city}
                      </h3>
                      {item.country && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.country}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.searchedAt)}
                      </span>
                      {item.temperature && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {item.temperature}°C
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchHistory;