// frontend/src/services/alternativeRoutesService.js
import api from './api';

/**
 * Alternative Routes Service - Fetches multiple route options
 * This service works alongside the existing route planning without modifying it
 */
const alternativeRoutesService = {
  /**
   * Get alternative routes between start and destination
   * @param {Object} params - { startLocation, endLocation, waypoints }
   * @returns {Promise} Array of route alternatives with weather data
   */
  getAlternatives: async ({ startLocation, endLocation, waypoints = [] }) => {
    try {
      const response = await api.post('/routes/alternatives', {
        startLocation,
        endLocation,
        waypoints
      });
      return response.data.data;
    } catch (error) {
      console.error('Failed to get alternative routes:', error);
      return { routes: [] };
    }
  },

  /**
   * Compare weather between multiple routes
   * @param {Array} routes - Array of route objects
   * @returns {Object} Comparison data
   */
  compareRouteWeather: (routes) => {
    if (!routes || routes.length === 0) return null;
    
    const comparison = {
      bestWeatherRoute: null,
      bestWeatherScore: 100,
      worstWeatherRoute: null,
      worstWeatherScore: 0,
      averageScores: {}
    };
    
    routes.forEach(route => {
      const weatherScore = route.weatherScore || 0;
      if (weatherScore < comparison.bestWeatherScore) {
        comparison.bestWeatherScore = weatherScore;
        comparison.bestWeatherRoute = route;
      }
      if (weatherScore > comparison.worstWeatherScore) {
        comparison.worstWeatherScore = weatherScore;
        comparison.worstWeatherRoute = route;
      }
      comparison.averageScores[route.name] = weatherScore;
    });
    
    return comparison;
  }
};

export default alternativeRoutesService;