// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Compass, CloudRain, Sun, Wind, ChevronLeft, ChevronRight } from 'lucide-react';
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

  // ========== NEW: Hero Slideshow ==========
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&h=600&fit=crop',
      title: 'Plan Your Perfect Journey',
      subtitle: 'Real-time weather intelligence for smarter travel decisions',
      gradient: 'from-blue-600/80 to-purple-600/80'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1200&h=600&fit=crop',
      title: 'Weather Along Your Route',
      subtitle: 'Know what to expect at every checkpoint of your journey',
      gradient: 'from-green-600/80 to-teal-600/80'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&h=600&fit=crop',
      title: 'Multi-Modal Travel Planning',
      subtitle: 'Compare Road, Train, and Flight options with weather insights',
      gradient: 'from-orange-600/80 to-red-600/80'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1470071459604-7b9ec44d7c9e?w=1200&h=600&fit=crop',
      title: 'AI-Powered Travel Assistant',
      subtitle: 'WISE helps you plan, navigate, and stay safe',
      gradient: 'from-purple-600/80 to-pink-600/80'
    }
  ];

  // Auto-slide
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  // ========== Auto-detect search parameter from URL ==========
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchCity = params.get('search');
    
    if (searchCity && searchCity.trim()) {
      const cityName = decodeURIComponent(searchCity);
      setSearchQuery(cityName);
      
      if (isAuthenticated) {
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
      {/* ========== NEW: Hero Slideshow ========== */}
      <div className="relative h-[600px] md:h-[700px] overflow-hidden">
        {/* Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
            
            {/* Content */}
            <div className="relative container mx-auto px-4 h-full flex items-center">
              <div className="max-w-2xl text-white">
                <h1 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-xl md:text-2xl mb-8 opacity-90">
                  {slide.subtitle}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Search Form - Overlay on hero */}
        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
              <div className="flex gap-2 bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-2xl">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Search any city worldwide..."
                    className="w-full px-6 py-4 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-transparent"
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
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all duration-300 backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Indicator */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 hover:bg-white/80'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* WeatherRoute Logo on Hero */}
        <div className="absolute top-8 left-8 z-20">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🌤️</span>
            <span className="text-2xl font-bold text-white drop-shadow-lg">
              WeatherRoute
            </span>
          </div>
        </div>
      </div>

      {/* Features Section - UNCHANGED */}
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