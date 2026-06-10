// frontend/src/pages/Favorites.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Trash2, Search } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import toast from 'react-hot-toast';

const Favorites = () => {
  const { favorites, fetchFavorites, removeFavorite } = useWeather();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    await fetchFavorites();
    setLoading(false);
  };

  const handleRemove = async (id, name) => {
    if (window.confirm(`Remove ${name} from favorites?`)) {
      await removeFavorite(id);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold dark:text-white">My Favorites</h1>
        <Link to="/" className="btn-primary flex items-center gap-2">
          <Search className="w-4 h-4" />
          Add More
        </Link>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-2xl font-semibold dark:text-white mb-2">No favorites yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start adding locations to see them here
          </p>
          <Link to="/" className="btn-primary">
            Search Locations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((fav) => (
            <div key={fav._id} className="weather-card overflow-hidden">
              <Link to={`/weather/${encodeURIComponent(fav.locationName)}?lat=${fav.lat}&lon=${fav.lng}`}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold dark:text-white">{fav.locationName}</h3>
                      <p className="text-gray-500 dark:text-gray-400">{fav.country}</p>
                    </div>
                    <MapPin className="w-5 h-5 text-primary-500" />
                  </div>
                  
                  {fav.cachedWeather && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-dark-300">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">Temperature</span>
                        <span className="font-semibold dark:text-white">{fav.cachedWeather.temp}°C</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-600 dark:text-gray-300">Condition</span>
                        <span className="font-semibold dark:text-white">{fav.cachedWeather.condition}</span>
                      </div>
                    </div>
                  )}
                  
                  {fav.customName && (
                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400 italic">
                      "{fav.customName}"
                    </p>
                  )}
                </div>
              </Link>
              
              <div className="px-6 pb-6">
                <button
                  onClick={() => handleRemove(fav._id, fav.locationName)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;