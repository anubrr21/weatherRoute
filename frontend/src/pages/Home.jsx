// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Compass, CloudRain, Sun, Wind } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { searchCities } = useWeather();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ========== NEW: Auto-detect search parameter from URL ==========
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchCity = params.get('search');
    
    if (searchCity && searchCity.trim()) {
      // Clear the URL parameter to prevent re-triggering
      const cityName = decodeURIComponent(searchCity);
      setSearchQuery(cityName);
      
      // Auto-trigger weather search for the city
      if (isAuthenticated) {
        // Small delay to ensure state is updated
        setTimeout(() => {
          navigate(`/weather/${encodeURIComponent(cityName)}`);
        }, 100);
      } else {
        navigate('/login');
      }
    }
  }, [location.search, isAuthenticated, navigate]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    if (isAuthenticated) {
      navigate(`/weather/${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/login');
    }
  };

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    if (value.length >= 2) {
      const results = await searchCities(value);
      setSuggestions(results);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (city) => {
    setSearchQuery(`${city.name}, ${city.country}`);
    setShowSuggestions(false);
    if (isAuthenticated) {
      navigate(`/weather/${encodeURIComponent(city.name)}?lat=${city.lat}&lon=${city.lon}`);
    } else {
      navigate('/login');
    }
  };

  const features = [
    { icon: <Sun className="w-8 h-8" />, title: 'Real-time Weather', description: 'Current conditions and 5-day forecast' },
    { icon: <Wind className="w-8 h-8" />, title: 'Air Quality', description: 'Monitor AQI and pollutants' },
    { icon: <MapPin className="w-8 h-8" />, title: 'Interactive Maps', description: 'Visualize weather on maps' },
    { icon: <Compass className="w-8 h-8" />, title: 'Route Planning', description: 'Weather along your journey' },
    { icon: <CloudRain className="w-8 h-8" />, title: 'Rain Alerts', description: 'Get notified about precipitation' },
    { icon: <Search className="w-8 h-8" />, title: 'Smart Search', description: 'Search any location worldwide' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 dark:from-primary-600 dark:to-primary-800 text-white">
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
              WeatherRoute
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Your intelligent weather companion for smarter travel planning
            </p>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Search any city worldwide..."
                    className="w-full px-6 py-4 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-dark-200 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                      {suggestions.map((city, index) => (
                        <button
                          key={index}
                          onClick={() => selectSuggestion(city)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                        >
                          <div className="font-medium text-gray-900 dark:text-white">
                            {city.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {city.country} {city.state && `, ${city.state}`}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12 dark:text-white">
          Features that make a difference
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="weather-card p-6 text-center hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="text-primary-500 mb-4 flex justify-center">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-white">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;