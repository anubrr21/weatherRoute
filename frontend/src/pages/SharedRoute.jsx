// frontend/src/pages/SharedRoute.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Navigation, Clock, Ruler, User, Calendar, AlertCircle, CloudRain, Wind, Droplet } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import shareService from '../services/shareService';

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const SharedRoute = () => {
  const { shareToken } = useParams();
  const [loading, setLoading] = useState(true);
  const [routeData, setRouteData] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const routeLayerRef = useRef(null);

  useEffect(() => {
    loadSharedRoute();
  }, [shareToken]);

  useEffect(() => {
    if (routeData && routeData.routeData?.geometry && mapRef.current && !mapInstanceRef.current) {
      initMap();
    }
  }, [routeData]);

  const initMap = () => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView([20, 0], 2);
    
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; CartoDB',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(mapInstanceRef.current);

    // Draw the route
    if (routeData?.routeData?.geometry) {
      const geojson = routeData.routeData.geometry;
      const routeLayer = L.geoJSON(geojson, {
        style: {
          color: '#3B82F6',
          weight: 5,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        }
      }).addTo(mapInstanceRef.current);
      
      routeLayerRef.current = routeLayer;

      // Add start marker
      if (routeData.startLocation) {
        const startIcon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div style="background-color: #10B981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
          iconSize: [20, 20]
        });
        L.marker([routeData.startLocation.lat, routeData.startLocation.lng], { icon: startIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Start</b><br>${routeData.startLocation.name}`);
      }

      // Add destination marker
      if (routeData.endLocation) {
        const endIcon = L.divIcon({
          className: 'custom-div-icon',
          html: '<div style="background-color: #EF4444; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.2);"></div>',
          iconSize: [20, 20]
        });
        L.marker([routeData.endLocation.lat, routeData.endLocation.lng], { icon: endIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`<b>Destination</b><br>${routeData.endLocation.name}`);
      }

      // Fit bounds
      const bounds = routeLayer.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  };

  const loadSharedRoute = async () => {
    setLoading(true);
    try {
      const data = await shareService.getSharedRoute(shareToken);
      setRouteData(data);
    } catch (error) {
      console.error('Failed to load shared route:', error);
      setError(error.response?.data?.message || 'This share link is invalid or expired');
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
      'Fog': '🌫️'
    };
    return icons[condition] || '🌤️';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold dark:text-white mb-2">Share Link Expired</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center mb-6">{error}</p>
        <Link to="/" className="btn-primary">
          Go to WeatherRoute
        </Link>
      </div>
    );
  }

  const { startLocation, endLocation, routeData: route, weatherData, sharedBy, createdAt } = routeData;
  const distance = route?.distance?.text || `${Math.round(route?.distance?.meters / 1000)} km`;
  const duration = route?.duration?.text || `${Math.round(route?.duration?.minutes)} min`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-100 dark:bg-primary-900/30 rounded-full text-primary-600 dark:text-primary-400 text-sm mb-3">
          <User className="w-3 h-3" />
          Shared by {sharedBy}
        </div>
        <h1 className="text-3xl font-bold dark:text-white mb-2">Shared Travel Route</h1>
        <p className="text-gray-500 dark:text-gray-400">
          <Calendar className="w-4 h-4 inline mr-1" />
          Created on {new Date(createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Route Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="weather-card p-4 text-center">
          <MapPin className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <h3 className="text-sm text-gray-500 dark:text-gray-400">From</h3>
          <p className="font-semibold dark:text-white">{startLocation?.name}</p>
        </div>
        
        <div className="weather-card p-4 text-center">
          <Navigation className="w-6 h-6 text-primary-500 mx-auto mb-2" />
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Route Details</h3>
          <p className="font-semibold dark:text-white">{distance}</p>
          <p className="text-sm text-gray-500">{duration}</p>
        </div>
        
        <div className="weather-card p-4 text-center">
          <MapPin className="w-6 h-6 text-red-500 mx-auto mb-2" />
          <h3 className="text-sm text-gray-500 dark:text-gray-400">To</h3>
          <p className="font-semibold dark:text-white">{endLocation?.name}</p>
        </div>
      </div>

      {/* Map */}
      <div className="weather-card p-4 mb-6">
        <h2 className="text-xl font-semibold dark:text-white mb-4">Route Map</h2>
        <div className="h-96 rounded-lg overflow-hidden" ref={mapRef}></div>
      </div>

      {/* Weather Checkpoints - EXACT SAME AS USER SEES */}
      {weatherData && weatherData.points && weatherData.points.length > 0 && (
        <div className="weather-card p-4 mb-6">
          <h2 className="text-xl font-semibold dark:text-white mb-4 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-primary-500" />
            Weather Along Route
          </h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {weatherData.points.map((point, idx) => {
              const isStart = idx === 0;
              const isDestination = idx === weatherData.points.length - 1;
              const title = isStart ? '🏁 Start' : isDestination ? '🏆 Destination' : `📍 Checkpoint ${idx}`;
              
              return (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-dark-300 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium dark:text-white">{title}</span>
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

      {/* Risk Analysis */}
      {weatherData?.riskAnalysis && (
        <div className="weather-card p-4 mb-6">
          <h2 className="text-xl font-semibold dark:text-white mb-4">Weather Risk Analysis</h2>
          <div className={`p-3 rounded-lg ${
            weatherData.riskAnalysis.score < 30 ? 'bg-green-100 dark:bg-green-900/30' :
            weatherData.riskAnalysis.score < 60 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
            'bg-red-100 dark:bg-red-900/30'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className="font-semibold">Risk Score</span>
              <span className="text-2xl font-bold">{Math.round(weatherData.riskAnalysis.score)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-current rounded-full h-2 transition-all duration-500"
                style={{ 
                  width: `${weatherData.riskAnalysis.score}%`,
                  backgroundColor: weatherData.riskAnalysis.score < 30 ? '#10B981' : weatherData.riskAnalysis.score < 60 ? '#F59E0B' : '#EF4444'
                }}
              />
            </div>
            <p className="text-sm">{weatherData.riskAnalysis.overall === 'low' ? '✅ Low risk - Good travel conditions' : weatherData.riskAnalysis.overall === 'moderate' ? '⚠️ Moderate risk - Drive with caution' : '🚨 High risk - Consider postponing'}</p>
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="text-center">
        <Link to="/" className="btn-primary inline-flex items-center gap-2">
          Plan Your Own Trip
          <Navigation className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default SharedRoute;