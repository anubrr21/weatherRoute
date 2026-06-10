// frontend/src/pages/Dashboard.jsx
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Heart, History, Compass, Search, Calendar, TrendingUp, Clock, Navigation, Star, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWeather } from '../context/WeatherContext';
import { useHistory } from '../context/HistoryContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, fetchFavorites, fetchSearchHistory, searchHistory: weatherSearchHistory } = useWeather();
  const { searchStats, routeStats, getRecentSearches, reloadHistory } = useHistory();

  useEffect(() => {
    fetchFavorites();
    fetchSearchHistory();
    reloadHistory();
  }, []);

  const recentSearches = getRecentSearches(5);

  const handleSearchClick = (city, lat, lon) => {
    navigate(`/weather/${encodeURIComponent(city)}?lat=${lat}&lon=${lon}`);
  };

  const stats = [
    { 
      label: 'Favorites', 
      value: favorites.length, 
      icon: Heart, 
      color: 'text-red-500', 
      bg: 'bg-red-100 dark:bg-red-900/30',
      path: '/favorites',
      clickable: true
    },
    { 
      label: 'Searches', 
      value: searchStats.totalSearches || 0, 
      icon: Search, 
      color: 'text-blue-500', 
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      path: '/search-history',
      clickable: true
    },
    { 
      label: 'Routes Planned', 
      value: routeStats.totalRoutes || 0, 
      icon: Compass, 
      color: 'text-green-500', 
      bg: 'bg-green-100 dark:bg-green-900/30',
      path: '/route-history',
      clickable: true
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user?.username}! 👋
        </h1>
        <p className="opacity-90">
          Here's your weather overview and activity summary
        </p>
      </div>

      {/* Stats Grid - Now Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div
            key={index}
            onClick={() => stat.clickable && navigate(stat.path)}
            className={`weather-card p-6 ${stat.clickable ? 'cursor-pointer hover:scale-105 transition-all duration-300' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{stat.label}</p>
                <p className="text-3xl font-bold dark:text-white mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-3 rounded-full`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Dashboard Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Most Searched City Widget */}
        <div className="weather-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold dark:text-white">Most Searched City</h2>
          </div>
          {searchStats.mostSearchedCity ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-2">📍</div>
              <p className="text-xl font-bold dark:text-white">{searchStats.mostSearchedCity.city}</p>
              <p className="text-gray-500 dark:text-gray-400">{searchStats.mostSearchedCity.count} searches</p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No searches yet</p>
          )}
        </div>

        {/* Last Route Planned Widget */}
        <div className="weather-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold dark:text-white">Last Route Planned</h2>
          </div>
          {routeStats.lastRoute ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MapPin className="w-4 h-4 text-green-500" />
                <span className="font-medium">{routeStats.lastRoute.startLocation}</span>
                <Navigation className="w-4 h-4 text-gray-400" />
                <MapPin className="w-4 h-4 text-red-500" />
                <span className="font-medium">{routeStats.lastRoute.destination}</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {routeStats.lastRoute.createdAt && new Date(routeStats.lastRoute.createdAt).toLocaleDateString()}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-4">No routes planned yet</p>
          )}
        </div>
      </div>

      {/* Weather Searches This Week & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="weather-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold dark:text-white">Weather Searches This Week</h2>
          </div>
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-primary-500">{searchStats.searchesThisWeek || 0}</p>
            <p className="text-gray-500 dark:text-gray-400 mt-1">weather lookups</p>
          </div>
        </div>

        {/* Quick Actions Section */}
        <div className="weather-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-semibold dark:text-white">Quick Actions</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-dark-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
            >
              <Search className="w-5 h-5 text-primary-500" />
              <span className="text-xs dark:text-white">Search</span>
            </button>
            <button
              onClick={() => navigate('/route-planner')}
              className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-dark-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
            >
              <Navigation className="w-5 h-5 text-green-500" />
              <span className="text-xs dark:text-white">Plan Route</span>
            </button>
            <button
              onClick={() => navigate('/favorites')}
              className="flex flex-col items-center gap-2 p-3 bg-gray-50 dark:bg-dark-300 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-200 transition-colors"
            >
              <Heart className="w-5 h-5 text-red-500" />
              <span className="text-xs dark:text-white">Favorites</span>
            </button>
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold dark:text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            Favorite Locations
          </h2>
          <Link to="/favorites" className="text-primary-500 hover:text-primary-600">
            View all →
          </Link>
        </div>
        
        {favorites.length === 0 ? (
          <div className="weather-card p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No favorites yet. Start adding locations to see them here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favorites.slice(0, 3).map((fav) => (
              <Link
                key={fav._id}
                to={`/weather/${encodeURIComponent(fav.locationName)}?lat=${fav.lat}&lon=${fav.lng}`}
                className="weather-card p-4 hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold dark:text-white">{fav.locationName}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{fav.country}</p>
                  </div>
                  <MapPin className="w-4 h-4 text-primary-500" />
                </div>
                {fav.cachedWeather && (
                  <div className="mt-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {fav.cachedWeather.temp}°C - {fav.cachedWeather.condition}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Searches Section - NOW DYNAMIC */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold dark:text-white flex items-center gap-2">
            <History className="w-6 h-6 text-blue-500" />
            Recent Searches
          </h2>
          {recentSearches.length > 0 && (
            <Link to="/search-history" className="text-primary-500 hover:text-primary-600 text-sm">
              View all →
            </Link>
          )}
        </div>
        
        {recentSearches.length === 0 ? (
          <div className="weather-card p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No search history yet. Start searching for locations!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentSearches.map((search) => (
              <button
                key={search._id}
                onClick={() => handleSearchClick(search.city, search.lat, search.lon)}
                className="weather-card p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-dark-300 transition-colors w-full text-left"
              >
                <div>
                  <p className="font-medium dark:text-white">{search.city}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(search.searchedAt).toLocaleDateString()} at {new Date(search.searchedAt).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  {search.temperature && (
                    <p className="text-sm font-semibold dark:text-white">{search.temperature}°C</p>
                  )}
                  <p className="text-xs text-gray-400">{search.weatherCondition}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;