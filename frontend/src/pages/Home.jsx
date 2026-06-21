// frontend/src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, MapPin, Compass, CloudRain, Sun, Wind, ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';
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

  // ========== Enhanced Hero Slideshow ==========
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1600&h=800&fit=crop&q=80',
      title: 'Plan Your Perfect Journey',
      subtitle: 'Real-time weather intelligence for smarter travel decisions',
      gradient: 'from-blue-600/70 via-blue-700/60 to-purple-800/70',
      overlay: 'bg-gradient-to-r',
      textColor: 'text-white'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1600&h=800&fit=crop&q=80',
      title: 'Weather Along Every Mile',
      subtitle: 'Know what to expect at every checkpoint of your journey',
      gradient: 'from-emerald-600/70 via-green-700/60 to-teal-800/70',
      overlay: 'bg-gradient-to-r',
      textColor: 'text-white'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1600&h=800&fit=crop&q=80',
      title: 'Compare Every Mode of Travel',
      subtitle: 'Road, Train, and Flight options with weather intelligence',
      gradient: 'from-amber-600/70 via-orange-700/60 to-red-800/70',
      overlay: 'bg-gradient-to-r',
      textColor: 'text-white'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1470071459604-7b9ec44d7c9e?w=1600&h=800&fit=crop&q=80',
      title: 'AI-Powered Travel Assistant',
      subtitle: 'WISE helps you plan, navigate, and stay safe on every trip',
      gradient: 'from-purple-600/70 via-pink-700/60 to-rose-800/70',
      overlay: 'bg-gradient-to-r',
      textColor: 'text-white'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1600&h=800&fit=crop&q=80',
      title: 'Smart Travel, Better Decisions',
      subtitle: 'Weather risk analysis and route optimization at your fingertips',
      gradient: 'from-cyan-600/70 via-blue-700/60 to-indigo-800/70',
      overlay: 'bg-gradient-to-r',
      textColor: 'text-white'
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1600&h=800&fit=crop&q=80',
      title: 'Your Journey, Your Way',
      subtitle: 'Personalized travel recommendations powered by AI',
      gradient: 'from-rose-600/70 via-pink-700/60 to-purple-800/70',
      overlay: 'bg-gradient-to-r',
      textColor: 'text-white'
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1600&h=800&fit=crop&q=80',
      title: 'Adventure Awaits',
      subtitle: 'Explore with confidence with real-time weather updates',
      gradient: 'from-indigo-600/70 via-violet-700/60 to-purple-800/70',
      overlay: 'bg-gradient-to-r',
      textColor: 'text-white'
    },
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1600&h=800&fit=crop&q=80',
      title: 'Plan Smarter, Travel Safer',
      subtitle: 'WeatherRoute combines navigation with real-time weather intelligence',
      gradient: 'from-teal-600/70 via-cyan-700/60 to-blue-800/70',
      overlay: 'bg-gradient-to-r',
      textColor: 'text-white'
    }
  ];

  // Auto-slide
  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
      }, 6000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, heroSlides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  // Auto-detect search parameter from URL
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
      {/* Enhanced Hero Slideshow */}
      <div className="relative h-[600px] md:h-[700px] lg:h-[800px] overflow-hidden">
        {/* Slides */}
        {heroSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-[1200ms] ease-in-out ${
              index === currentSlide 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-105'
            }`}
          >
            {/* Background Image with Zoom Effect */}
            <div 
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[6000ms] ${
                index === currentSlide ? 'scale-110' : 'scale-100'
              }`}
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            
            {/* Enhanced Gradient Overlay */}
            <div className={`absolute inset-0 ${slide.overlay} ${slide.gradient} opacity-90`} />
            
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />

            {/* Content */}
            <div className="relative container mx-auto px-4 h-full flex items-center">
              <div className="max-w-3xl">
                {/* Subtle Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium text-white/90 tracking-wide">WeatherRoute Premium</span>
                </div>
                
                <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-4 animate-fade-in ${slide.textColor} drop-shadow-2xl`}>
                  {slide.title}
                </h1>
                <p className={`text-xl md:text-2xl lg:text-3xl mb-8 ${slide.textColor} opacity-90 drop-shadow-lg`}>
                  {slide.subtitle}
                </p>
                
                {/* Animated Arrow Indicator */}
                <div className="flex items-center gap-2 text-white/60 animate-bounce-slow">
                  <span className="text-sm tracking-widest uppercase font-light">Explore</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Slide Number Indicator */}
            <div className="absolute bottom-40 right-8 text-white/20 text-sm font-light tracking-widest hidden lg:block">
              {String(index + 1).padStart(2, '0')} / {String(heroSlides.length).padStart(2, '0')}
            </div>
          </div>
        ))}

        {/* Search Form - Glass Morphism Style */}
        <div className="absolute bottom-0 left-0 right-0 pb-16 lg:pb-20">
          <div className="container mx-auto px-4">
            <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
              <div className="flex gap-2 bg-white/10 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/20">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleInputChange}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder="Search any city worldwide..."
                    className="w-full px-6 py-4 text-white placeholder-white/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/30 bg-white/5 backdrop-blur-sm"
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-dark-200/95 backdrop-blur-sm rounded-xl shadow-xl z-50 max-h-64 overflow-y-auto border border-gray-200/50 dark:border-dark-300/50">
                      {suggestions.map((city, index) => (
                        <button
                          key={index}
                          onClick={() => selectSuggestion(city)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-100/80 dark:hover:bg-dark-300/80 transition-colors"
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
                  className="bg-gradient-to-r from-white/20 to-white/10 text-white px-8 py-4 rounded-xl font-semibold hover:from-white/30 hover:to-white/20 transition-all duration-300 backdrop-blur-sm border border-white/30 shadow-lg hover:shadow-xl"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Navigation Arrows - Enhanced */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all duration-300 border border-white/20 hover:scale-110"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 text-white transition-all duration-300 border border-white/20 hover:scale-110"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Dots Indicator - Enhanced */}
        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-2.5">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-500 rounded-full ${
                index === currentSlide 
                  ? 'bg-white w-10 h-2.5 shadow-lg shadow-white/20' 
                  : 'bg-white/40 hover:bg-white/60 w-2.5 h-2.5'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Floating Elements for Aesthetic */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
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