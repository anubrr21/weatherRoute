// frontend/src/context/HistoryContext.jsx
import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import historyService from '../services/historyService';
import { useAuth } from './AuthContext';

const HistoryContext = createContext();

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistory must be used within HistoryProvider');
  }
  return context;
};

export const HistoryProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [searchHistory, setSearchHistory] = useState([]);
  const [routeHistory, setRouteHistory] = useState([]);
  const [searchStats, setSearchStats] = useState({
    totalSearches: 0,
    mostSearchedCity: null,
    searchesThisWeek: 0
  });
  const [routeStats, setRouteStats] = useState({
    totalRoutes: 0,
    lastRoute: null
  });
  const [loading, setLoading] = useState(false);
  
  // Debounce refs to prevent duplicate saves
  const pendingSearchSave = useRef(null);
  const lastSavedSearch = useRef({ city: '', timestamp: 0 });

  // Load history when user logs in
  useEffect(() => {
    if (isAuthenticated) {
      loadAllHistory();
    } else {
      setSearchHistory([]);
      setRouteHistory([]);
      setSearchStats({ totalSearches: 0, mostSearchedCity: null, searchesThisWeek: 0 });
      setRouteStats({ totalRoutes: 0, lastRoute: null });
    }
  }, [isAuthenticated]);

  const loadAllHistory = async () => {
    setLoading(true);
    try {
      const [searches, routes, stats, routeStatsData] = await Promise.all([
        historyService.getSearchHistory(),
        historyService.getRouteHistory(),
        historyService.getSearchStats(),
        historyService.getRouteStats()
      ]);
      
      setSearchHistory(searches.searches || []);
      setRouteHistory(routes.routes || []);
      setSearchStats(stats);
      setRouteStats(routeStatsData);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const addSearch = async (searchData) => {
    if (!isAuthenticated) return null;
    
    // Prevent duplicate saves within 2 seconds for same city
    const now = Date.now();
    const lastSaved = lastSavedSearch.current;
    if (lastSaved.city === searchData.city && (now - lastSaved.timestamp) < 2000) {
      console.log('Duplicate search prevented for:', searchData.city);
      return null;
    }
    
    // Clear any pending save
    if (pendingSearchSave.current) {
      clearTimeout(pendingSearchSave.current);
    }
    
    // Debounce the save operation
    return new Promise((resolve) => {
      pendingSearchSave.current = setTimeout(async () => {
        try {
          const result = await historyService.saveSearch(searchData);
          if (result) {
            lastSavedSearch.current = { city: searchData.city, timestamp: Date.now() };
            await loadAllHistory();
          }
          pendingSearchSave.current = null;
          resolve(result);
        } catch (error) {
          console.error('Failed to save search:', error);
          pendingSearchSave.current = null;
          resolve(null);
        }
      }, 300);
    });
  };

  const addRoute = async (routeData) => {
    if (!isAuthenticated) return null;
    
    try {
      const result = await historyService.saveRoute(routeData);
      if (result) {
        await loadAllHistory();
      }
      return result;
    } catch (error) {
      console.error('Failed to save route:', error);
      return null;
    }
  };

  const clearSearches = async () => {
    await historyService.clearSearchHistory();
    await loadAllHistory();
  };

  const deleteRoute = async (routeId) => {
    await historyService.deleteRoute(routeId);
    await loadAllHistory();
  };

  const getRecentSearches = (limit = 5) => {
    return [...searchHistory].sort((a, b) => 
      new Date(b.searchedAt) - new Date(a.searchedAt)
    ).slice(0, limit);
  };

  const value = {
    searchHistory,
    routeHistory,
    searchStats,
    routeStats,
    loading,
    addSearch,
    addRoute,
    clearSearches,
    deleteRoute,
    getRecentSearches,
    reloadHistory: loadAllHistory
  };

  return (
    <HistoryContext.Provider value={value}>
      {children}
    </HistoryContext.Provider>
  );
};