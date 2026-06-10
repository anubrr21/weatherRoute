// frontend/src/pages/RoutePlannerPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Plus, X, AlertCircle, Calendar, Clock, Ruler, CloudRain } from 'lucide-react';
import { useWeather } from '../context/WeatherContext';
import { useHistory } from '../context/HistoryContext';
import routeService from '../services/routeService';
import RouteMap from '../components/map/RouteMap';
import WeatherRiskCard from '../components/weather/WeatherRiskCard';
import toast from 'react-hot-toast';
import RouteAlternatives from '../components/route/RouteAlternatives';
import api from '../services/api';
import TransportTabs from '../components/transport/TransportTabs';
import TransportComparison from '../components/transport/TransportComparison';
import transportService from '../services/transportService';
import WeatherAlertBanner from '../components/alerts/WeatherAlertBanner';
import { useAlerts } from '../context/AlertContext';
import ShareButton from '../components/share/ShareButton';

// Local cache for location names (frontend side)
const locationNameFrontendCache = new Map();

const getLocationNameFromBackend = async (lat, lng) => {
  // Round coordinates to 3 decimal places for consistent caching
  const roundedLat = Math.round(lat * 1000) / 1000;
  const roundedLng = Math.round(lng * 1000) / 1000;
  const cacheKey = `${roundedLat},${roundedLng}`;
  
  // Check frontend cache first
  if (locationNameFrontendCache.has(cacheKey)) {
    return locationNameFrontendCache.get(cacheKey);
  }
  
  try {
    const response = await api.get('/geocode/reverse', {
      params: { lat: roundedLat, lng: roundedLng }
    });
    
    const locationName = response.data.data.locationName;
    if (locationName) {
      locationNameFrontendCache.set(cacheKey, locationName);
      // Clear cache after 1 hour
      setTimeout(() => locationNameFrontendCache.delete(cacheKey), 3600000);
    }
    return locationName;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

const RoutePlannerPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { loadRouteAlerts } = useAlerts();
  const { addRoute } = useHistory();
  const [startLocation, setStartLocation] = useState('');
  const [endLocation, setEndLocation] = useState('');
  const [waypoints, setWaypoints] = useState([]);
  const [routeData, setRouteData] = useState(null);
  const [locations, setLocations] = useState(null);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState({});
  const [checkpointNames, setCheckpointNames] = useState({});
  const { searchCities } = useWeather();
  const [isLoadingSavedRoute, setIsLoadingSavedRoute] = useState(false);
  const [selectedAlternativeRoute, setSelectedAlternativeRoute] = useState(null);
  
  // NEW: Transport state variables
  const [trainData, setTrainData] = useState(null);
  const [flightData, setFlightData] = useState(null);
  const [transportData, setTransportData] = useState(null);
  const [isLoadingTransport, setIsLoadingTransport] = useState(false);

  // Handle selecting an alternative route
  const handleAlternativeRouteSelect = async (alternativeRoute) => {
    setLoading(true);
    try {
      // Use the alternative route's geometry to fetch weather
      const weatherResult = await routeService.getWeatherForRouteGeometry({
        geometry: alternativeRoute.geometry,
        distance: alternativeRoute.distance
      });
      
      // Create route data structure matching existing format
      const newRouteData = {
        ...routeData,
        id: alternativeRoute.id,
        distance: alternativeRoute.distance,
        duration: alternativeRoute.duration,
        geometry: alternativeRoute.geometry
      };
      
      setRouteData(newRouteData);
      setWeatherData(weatherResult);
      setSelectedAlternativeRoute(alternativeRoute.id);
      toast.success(`Switched to ${alternativeRoute.name}`);
    } catch (error) {
      console.error('Failed to switch route:', error);
      toast.error('Could not load selected route');
    } finally {
      setLoading(false);
    }
  };

  // Load saved route from navigation state
  useEffect(() => {
    const loadSavedRoute = async () => {
      const state = location.state;
      if (state?.loadSavedRoute && !isLoadingSavedRoute) {
        setIsLoadingSavedRoute(true);
        
        setStartLocation(state.startLocation);
        setEndLocation(state.endLocation);
        setWaypoints(state.waypoints || []);
        
        // Auto-trigger route planning after a short delay to ensure state is updated
        setTimeout(async () => {
          try {
            const result = await routeService.planRoute({
              startLocation: state.startLocation,
              endLocation: state.endLocation,
              waypoints: state.waypoints || []
            });
            
            setRouteData(result.route);
            setLocations(result.locations);
            setWeatherData(result.weatherAlongRoute);
            toast.success('Saved route loaded successfully!');
          } catch (error) {
            console.error('Failed to load saved route:', error);
            toast.error('Failed to load saved route');
          } finally {
            setIsLoadingSavedRoute(false);
          }
        }, 100);
        
        // Clear the state to prevent reloading on refresh
        window.history.replaceState({}, document.title);
      }
    };
    
    loadSavedRoute();
  }, [location.state]);

  // NEW: Fetch train and flight options when road route is planned
  useEffect(() => {
    const fetchTransportOptions = async () => {
      if (startLocation && endLocation && !isLoadingTransport) {
        setIsLoadingTransport(true);
        try {
          const result = await transportService.getAllTransportOptions({
            startLocation,
            endLocation,
            travelDate: new Date().toISOString().split('T')[0]
          });
          setTrainData(result.train);
          setFlightData(result.flight);
          setTransportData(result);
        } catch (error) {
          console.error('Failed to fetch transport options:', error);
        } finally {
          setIsLoadingTransport(false);
        }
      }
    };
    
    fetchTransportOptions();
  }, [startLocation, endLocation, routeData]);

  // Fetch location names for checkpoints using backend API
  useEffect(() => {
    const fetchCheckpointNames = async () => {
      if (!weatherData?.points || weatherData.points.length === 0) return;
      
      const names = {};
      for (let i = 0; i < weatherData.points.length; i++) {
        const point = weatherData.points[i];
        const key = i;
        
        // Start point - use location name
        if (i === 0 && locations?.start) {
          names[key] = locations.start.name.split(',')[0];
        }
        // Destination point - use location name
        else if (i === weatherData.points.length - 1 && locations?.end) {
          names[key] = locations.end.name.split(',')[0];
        }
        // Intermediate checkpoints - fetch from backend API (no CORS issues)
        else {
          const name = await getLocationNameFromBackend(point.coordinates.lat, point.coordinates.lng);
          if (name) {
            names[key] = name;
          }
        }
      }
      setCheckpointNames(names);
    };
    
    fetchCheckpointNames();
  }, [weatherData, locations]);

  const handleLocationSearch = async (query, type) => {
    if (query.length < 2) return;
    
    const results = await searchCities(query);
    setSearchSuggestions(prev => ({
      ...prev,
      [type]: results.slice(0, 5)
    }));
  };

  const selectSuggestion = (city, type) => {
    const locationString = `${city.name}, ${city.country}`;
    if (type === 'start') {
      setStartLocation(locationString);
    } else if (type === 'end') {
      setEndLocation(locationString);
    }
    setSearchSuggestions(prev => ({ ...prev, [type]: [] }));
  };

  const addWaypoint = () => {
    setWaypoints([...waypoints, '']);
  };

  const updateWaypoint = (index, value) => {
    const newWaypoints = [...waypoints];
    newWaypoints[index] = value;
    setWaypoints(newWaypoints);
  };

  const removeWaypoint = (index) => {
    setWaypoints(waypoints.filter((_, i) => i !== index));
  };

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    
    if (!startLocation || !endLocation) {
      toast.error('Please enter both start and end locations');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await routeService.planRoute({
        startLocation,
        endLocation,
        waypoints: waypoints.filter(w => w.trim())
      });
      
      setRouteData(result.route);
      setLocations(result.locations);
      setWeatherData(result.weatherAlongRoute);
      
      // ========== NEW: Load weather alerts for this route ==========
      if (result.route && result.weatherAlongRoute) {
        await loadRouteAlerts(result.route, result.weatherAlongRoute, startLocation, endLocation);
      }
      
      // Save to route history
      await addRoute({
        startLocation: startLocation,
        destination: endLocation,
        waypoints: waypoints.filter(w => w.trim()),
        distance: result.route.distance?.text,
        duration: result.route.duration?.text
      });
      
      toast.success('Route planned successfully!');
    } catch (error) {
      console.error('Route planning failed:', error);
      toast.error(error.response?.data?.message || 'Failed to plan route');
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Snow': '❄️',
      'Thunderstorm': '⛈️',
      'Drizzle': '🌦️',
      'Mist': '🌫️',
      'Fog': '🌫️',
      'Smoke': '💨',
      'Haze': '🌫️'
    };
    return icons[condition] || '🌤️';
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold dark:text-white mb-8">Route Planner</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Route Form */}
        <div className="space-y-6">
          <div className="weather-card p-6">
            <form onSubmit={handlePlanRoute} className="space-y-4">
              {/* Start Location */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Start Location
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-5 w-5 text-green-500" />
                  </div>
                  <input
                    type="text"
                    value={startLocation}
                    onChange={(e) => {
                      setStartLocation(e.target.value);
                      handleLocationSearch(e.target.value, 'start');
                    }}
                    className="input-primary pl-10"
                    placeholder="Enter starting city"
                    required
                  />
                </div>
                {searchSuggestions.start && searchSuggestions.start.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-200 rounded-lg shadow-lg border border-gray-200 dark:border-dark-300">
                    {searchSuggestions.start.map((city, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectSuggestion(city, 'start')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-300 transition-colors"
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.country} {city.state && `, ${city.state}`}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Destination */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Destination
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Navigation className="h-5 w-5 text-red-500" />
                  </div>
                  <input
                    type="text"
                    value={endLocation}
                    onChange={(e) => {
                      setEndLocation(e.target.value);
                      handleLocationSearch(e.target.value, 'end');
                    }}
                    className="input-primary pl-10"
                    placeholder="Enter destination"
                    required
                  />
                </div>
                {searchSuggestions.end && searchSuggestions.end.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white dark:bg-dark-200 rounded-lg shadow-lg">
                    {searchSuggestions.end.map((city, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectSuggestion(city, 'end')}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-300"
                      >
                        <div className="font-medium">{city.name}</div>
                        <div className="text-sm text-gray-500">{city.country}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Waypoints */}
              {waypoints.map((waypoint, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={waypoint}
                      onChange={(e) => updateWaypoint(index, e.target.value)}
                      className="input-primary"
                      placeholder={`Waypoint ${index + 1}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeWaypoint(index)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              <button
                type="button"
                onClick={addWaypoint}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-primary-500 text-primary-500 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Stop
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Navigation className="w-4 h-4" />
                    Plan My Route
                  </>
                )}
              </button>
            </form>
          </div>
{/* Share Button - NEW */}
{routeData && locations && weatherData && (
  <ShareButton
    routeData={routeData}
    locations={locations}
    weatherData={weatherData}
  />
)}
          
          {/* ========== NEW: Weather Alerts Banner ========== */}
          <WeatherAlertBanner />
          
          {/* Route Information */}
          {routeData && (
            <div className="weather-card p-6">
              <h2 className="text-xl font-semibold dark:text-white mb-4 flex items-center gap-2">
                <Navigation className="w-5 h-5 text-primary-500" />
                Route Details
              </h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-3 bg-gray-50 dark:bg-dark-300 rounded-lg">
                  <Ruler className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold dark:text-white">
                    {routeData.distance?.text || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total Distance</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-dark-300 rounded-lg">
                  <Clock className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                  <div className="text-2xl font-bold dark:text-white">
                    {routeData.duration?.text || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Est. Duration</div>
                </div>
              </div>
              
              {routeData.summary && (
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {routeData.summary}
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Weather Along Route */}
          {weatherData && (
            <div className="weather-card p-6">
              <h2 className="text-xl font-semibold dark:text-white mb-4 flex items-center gap-2">
                <CloudRain className="w-5 h-5 text-primary-500" />
                Weather & Risk Analysis
              </h2>
              
              {weatherData.riskAnalysis && (
                <WeatherRiskCard 
                  riskAnalysis={weatherData.riskAnalysis}
                  weatherSummary={weatherData.summary}
                />
              )}
              
              {weatherData.points && weatherData.points.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-semibold dark:text-white mb-3">Weather Checkpoints</h3>
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    {weatherData.points.map((point, idx) => {
                      const placeName = checkpointNames[idx];
                      const isStart = idx === 0;
                      const isDestination = idx === weatherData.points.length - 1;
                      
                      let title = '';
                      if (isStart) {
                        title = '🏁 Start';
                      } else if (isDestination) {
                        title = '🏆 Destination';
                      } else {
                        title = placeName ? `📍 Checkpoint ${idx} - ${placeName}` : `📍 Checkpoint ${idx}`;
                      }
                      
                      return (
                        <div key={idx} className="p-3 bg-gray-50 dark:bg-dark-300 rounded-lg">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium dark:text-white">
                                {title}
                              </span>
                              <p className="text-xs text-gray-500">{point.distanceFromStartKm} km from start</p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl">{getWeatherIcon(point.weather?.condition)}</div>
                              <div className="text-sm font-semibold">{point.weather?.temp}°C</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Condition</span>
                              <p className="font-medium dark:text-white">{point.weather?.condition}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Wind</span>
                              <p className="font-medium dark:text-white">{point.weather?.windSpeed} m/s</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Humidity</span>
                              <p className="font-medium dark:text-white">{point.weather?.humidity}%</p>
                            </div>
                          </div>
                          
                          {point.weather?.visibility < 5000 && (
                            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                              ⚠️ Reduced visibility: {(point.weather.visibility / 1000).toFixed(1)} km
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Alternative Routes */}
          {routeData && startLocation && endLocation && (
            <RouteAlternatives
              startLocation={startLocation}
              endLocation={endLocation}
              waypoints={waypoints}
              onRouteSelect={handleAlternativeRouteSelect}
              currentRouteId={routeData.id}
            />
          )}
          
          {/* ========== NEW: Transport Comparison Section ========== */}
          {routeData && transportData && (
            <TransportComparison
              roadData={routeData}
              trainData={trainData}
              flightData={flightData}
              weatherImpact={transportData.weatherImpact}
              recommendation={transportData.recommendation}
            />
          )}
          
          {/* ========== NEW: Transport Tabs Section ========== */}
          {(routeData || trainData || flightData) && (
            <TransportTabs
              roadData={routeData}
              trainData={trainData}
              flightData={flightData}
              isLoading={isLoadingTransport}
              onRoadSelect={() => {}}
            />
          )}
        </div>
        
        {/* Map */}
        <div>
          <div className="weather-card p-6">
            <h2 className="text-xl font-semibold dark:text-white mb-4">Route Map</h2>
            <RouteMap 
              routeData={routeData}
              locations={locations}
              weatherPoints={weatherData?.points}
              height="500px"
            />
            {!routeData && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 text-center">
                Enter locations above and click "Plan My Route" to see your route on the map
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoutePlannerPage;