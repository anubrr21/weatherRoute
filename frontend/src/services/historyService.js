// frontend/src/services/historyService.js
import api from './api';

/**
 * History Service - Handles search and route history API calls
 */
const historyService = {
  /**
   * Save a weather search to history - with duplicate prevention
   */
  saveSearch: async (searchData) => {
    try {
      const response = await api.post('/history/search', searchData);
      return response.data;
    } catch (error) {
      // Don't log duplicate key errors as errors
      if (error.response?.data?.code === 'DUPLICATE_SEARCH') {
        console.log('Duplicate search prevented');
        return { data: { search: null } };
      }
      console.error('Failed to save search:', error);
      return null;
    }
  },

  getSearchHistory: async () => {
    try {
      const response = await api.get('/history/searches');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get search history:', error);
      return { searches: [] };
    }
  },

  clearSearchHistory: async () => {
    try {
      const response = await api.delete('/history/searches');
      return response.data;
    } catch (error) {
      console.error('Failed to clear search history:', error);
      return null;
    }
  },

  saveRoute: async (routeData) => {
    try {
      const response = await api.post('/history/route', routeData);
      return response.data;
    } catch (error) {
      console.error('Failed to save route:', error);
      return null;
    }
  },

  getRouteHistory: async () => {
    try {
      const response = await api.get('/history/routes');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get route history:', error);
      return { routes: [] };
    }
  },

  deleteRoute: async (routeId) => {
    try {
      const response = await api.delete(`/history/route/${routeId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete route:', error);
      return null;
    }
  },

  getSearchStats: async () => {
    try {
      const response = await api.get('/history/stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get search stats:', error);
      return {
        totalSearches: 0,
        mostSearchedCity: null,
        searchesThisWeek: 0
      };
    }
  },

  getRouteStats: async () => {
    try {
      const response = await api.get('/history/route-stats');
      return response.data.data;
    } catch (error) {
      console.error('Failed to get route stats:', error);
      return {
        totalRoutes: 0,
        lastRoute: null
      };
    }
  }
};

export default historyService;