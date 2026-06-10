// frontend/src/pages/RouteHistory.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Calendar, Clock, Ruler, Trash2, Eye } from 'lucide-react';
import { useHistory } from '../context/HistoryContext';
import toast from 'react-hot-toast';

const RouteHistory = () => {
  const navigate = useNavigate();
  const { routeHistory, deleteRoute, reloadHistory } = useHistory();

  const handleViewRoute = (route) => {
    // Navigate to route planner with route data in state
    navigate('/route-planner', {
      state: {
        loadSavedRoute: true,
        startLocation: route.startLocation,
        endLocation: route.destination,
        waypoints: route.waypoints || [],
        savedRouteData: route
      }
    });
  };

  const handleDeleteRoute = async (routeId, e) => {
    e.stopPropagation();
    if (window.confirm('Delete this route from history?')) {
      await deleteRoute(routeId);
      toast.success('Route deleted');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold dark:text-white">Route History</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          {routeHistory.length} {routeHistory.length === 1 ? 'route' : 'routes'} planned
        </p>
      </div>

      {routeHistory.length === 0 ? (
        <div className="weather-card p-12 text-center">
          <Navigation className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold dark:text-white mb-2">No route history yet</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Plan your first route to see it here
          </p>
          <button
            onClick={() => navigate('/route-planner')}
            className="btn-primary"
          >
            Plan a Route
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {routeHistory.map((route) => (
            <div
              key={route._id}
              className="weather-card p-5 hover:shadow-xl transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-500" />
                    <span className="font-medium dark:text-white">{route.startLocation}</span>
                    <Navigation className="w-4 h-4 text-gray-400" />
                    <MapPin className="w-4 h-4 text-red-500" />
                    <span className="font-medium dark:text-white">{route.destination}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(route.createdAt)}
                    </span>
                    {route.distance && (
                      <span className="flex items-center gap-1">
                        <Ruler className="w-3 h-3" />
                        {route.distance}
                      </span>
                    )}
                    {route.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {route.duration}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => handleDeleteRoute(route._id, e)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {route.waypoints && route.waypoints.length > 0 && (
                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Stops:</span> {route.waypoints.join(' → ')}
                </div>
              )}

              <button
                onClick={() => handleViewRoute(route)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Open Route
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RouteHistory;