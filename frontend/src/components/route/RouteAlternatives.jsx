// frontend/src/components/route/RouteAlternatives.jsx
import React, { useState, useEffect } from 'react';
import { Navigation, RefreshCw, AlertCircle } from 'lucide-react';
import alternativeRoutesService from '../../services/alternativeRoutesService';
import RouteComparisonCard from './RouteComparisonCard';
import toast from 'react-hot-toast';

const RouteAlternatives = ({ startLocation, endLocation, waypoints, onRouteSelect, currentRouteId }) => {
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [showAlternatives, setShowAlternatives] = useState(false);

  const fetchAlternatives = async () => {
    if (!startLocation || !endLocation) return;
    
    setLoading(true);
    try {
      const result = await alternativeRoutesService.getAlternatives({
        startLocation,
        endLocation,
        waypoints: waypoints.filter(w => w.trim())
      });
      
      setAlternatives(result.routes || []);
      if (result.routes && result.routes.length > 0) {
        toast.success(`Found ${result.routes.length} route alternatives!`);
      }
    } catch (error) {
      console.error('Failed to fetch alternatives:', error);
      toast.error('Could not load alternative routes');
    } finally {
      setLoading(false);
    }
  };

  const handleRouteSelect = (route) => {
    setSelectedRouteId(route.id);
    onRouteSelect(route);
  };

  if (!showAlternatives) {
    return (
      <div className="mt-4">
        <button
          onClick={() => {
            setShowAlternatives(true);
            fetchAlternatives();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-300 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-200 transition-colors"
        >
          <Navigation className="w-4 h-4" />
          View Alternative Routes
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold dark:text-white flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary-500" />
          Alternative Routes
        </h3>
        <button
          onClick={fetchAlternatives}
          disabled={loading}
          className="text-sm text-primary-500 hover:text-primary-600 flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {loading ? (
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-500">Finding alternative routes...</p>
        </div>
      ) : alternatives.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 dark:bg-dark-300 rounded-lg">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No alternative routes found</p>
          <button
            onClick={() => setShowAlternatives(false)}
            className="mt-3 text-sm text-primary-500 hover:text-primary-600"
          >
            Close
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {alternatives.map((route, idx) => (
            <RouteComparisonCard
              key={route.id}
              route={route}
              index={idx}
              isSelected={selectedRouteId === route.id || (!selectedRouteId && idx === 0)}
              onSelect={() => handleRouteSelect(route)}
            />
          ))}
          <button
            onClick={() => setShowAlternatives(false)}
            className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-center py-2"
          >
            Hide alternatives
          </button>
        </div>
      )}
    </div>
  );
};

export default RouteAlternatives;