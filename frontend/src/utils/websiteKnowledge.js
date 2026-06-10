// frontend/src/utils/websiteKnowledge.js

/**
 * Website Knowledge Layer - WISE understands every feature of WeatherRoute
 * This file contains all information about the website that the AI can reference
 */

export const websiteKnowledge = {
  // All available pages/routes in the application
  pages: {
    dashboard: {
      path: '/dashboard',
      name: 'Dashboard',
      description: 'Your personal dashboard showing favorites, search history, and activity statistics',
      features: ['View favorites', 'View search history', 'View route statistics', 'Weather searches this week', 'Most searched city', 'Last route planned'],
      howToFind: 'Click Dashboard in the navigation bar or use the quick actions section'
    },
    routePlanner: {
      path: '/route-planner',
      name: 'Route Planner',
      description: 'Plan routes between cities with weather checkpoints, rest stops, and risk analysis',
      features: ['Plan routes', 'View alternative routes', 'Weather along route', 'Rest stop recommendations', 'Risk analysis', 'Route map'],
      howToFind: 'Click Route Planner in the navigation bar or use the quick actions on dashboard'
    },
    favorites: {
      path: '/favorites',
      name: 'Favorites',
      description: 'Manage your saved favorite locations for quick weather access',
      features: ['View saved locations', 'Remove favorites', 'Quick weather lookup'],
      howToFind: 'Click Favorites in the navigation bar or from dashboard cards'
    },
    searchHistory: {
      path: '/search-history',
      name: 'Search History',
      description: 'View all your past weather searches with timestamps',
      features: ['View past searches', 'Revisit weather pages', 'Clear history'],
      howToFind: 'Click on the Searches card in Dashboard or navigate from navigation bar'
    },
    routeHistory: {
      path: '/route-history',
      name: 'Route History',
      description: 'View all your past planned routes',
      features: ['View past routes', 'Reopen saved routes', 'Delete routes'],
      howToFind: 'Click on the Routes Planned card in Dashboard or navigate from navigation bar'
    },
    weatherSearch: {
      path: '/',
      name: 'Weather Search',
      description: 'Search for weather in any city worldwide with 5-day forecast',
      features: ['Current weather', '5-day forecast', 'Air quality', 'Weather map', 'Sunrise/sunset'],
      howToFind: 'Use the search bar on the homepage or type a city name'
    }
  },

  // Feature descriptions for intelligent suggestions
  features: {
    alternativeRoutes: {
      name: 'Alternative Routes',
      description: 'Compare different route options with weather risk scores',
      whereToFind: 'After planning a route, click "View Alternative Routes" button',
      whenToSuggest: 'After planning a route, especially if weather risk is moderate or high'
    },
    weatherCheckpoints: {
      name: 'Weather Checkpoints',
      description: 'Detailed weather at multiple points along your route',
      whereToFind: 'After planning a route, scroll to "Weather Checkpoints" section',
      whenToSuggest: 'After planning any route over 100km'
    },
    riskAnalysis: {
      name: 'Weather Risk Analysis',
      description: 'Safety assessment with score and recommendations',
      whereToFind: 'In Route Planner under "Weather & Risk Analysis" section',
      whenToSuggest: 'After planning a route or when user asks about safety'
    },
    voiceInput: {
      name: 'Voice Input',
      description: 'Speak your queries instead of typing',
      whereToFind: 'Click the microphone icon in the chat input area',
      whenToSuggest: 'When user seems to be typing long queries'
    },
    darkMode: {
      name: 'Dark Mode',
      description: 'Switch between light and dark themes',
      whereToFind: 'Click the sun/moon icon in the navigation bar',
      whenToSuggest: 'Never automatically suggest - only if user asks'
    }
  },

  // Common questions and their answers about the website
  faq: {
    'where can I see my old routes': {
      answer: 'You can find all your previously planned routes in the Route History section. Click on "Route History" from the navigation bar or click the "Routes Planned" card on your Dashboard.',
      redirectTo: 'routeHistory'
    },
    'where can I see my weather searches': {
      answer: 'Your weather search history is available in the Search History page. You can access it from the Dashboard by clicking the "Searches" card, or from the navigation menu.',
      redirectTo: 'searchHistory'
    },
    'how do I compare routes': {
      answer: 'After planning a route in the Route Planner, click the "View Alternative Routes" button. This will show you different route options with weather risk comparisons.',
      redirectTo: 'routePlanner'
    },
    'how do I save a location': {
      answer: 'When viewing weather for any city, click the heart icon next to the city name. This will add it to your Favorites for quick access later.',
      redirectTo: 'favorites'
    },
    'where is my dashboard': {
      answer: 'Your Dashboard is the main landing page after logging in. You can also click "Dashboard" in the navigation bar at any time.',
      redirectTo: 'dashboard'
    },
    'how to plan a route': {
      answer: 'Go to Route Planner from the navigation bar, enter your start and destination cities, then click "Plan My Route". You can also add waypoints for multiple stops.',
      redirectTo: 'routePlanner'
    },
    'what is weather risk': {
      answer: 'Weather Risk Analysis is available in Route Planner. It calculates a risk score (0-100) based on rain, wind, visibility, and temperature extremes along your route.',
      redirectTo: 'routePlanner'
    }
  }
};

// Helper function to find relevant page based on user query
export const findRelevantPage = (query) => {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('route') || lowerQuery.includes('plan') || lowerQuery.includes('trip')) {
    return websiteKnowledge.pages.routePlanner;
  }
  if (lowerQuery.includes('favorite') || lowerQuery.includes('save') || lowerQuery.includes('star')) {
    return websiteKnowledge.pages.favorites;
  }
  if (lowerQuery.includes('history') || lowerQuery.includes('past') || lowerQuery.includes('previous')) {
    if (lowerQuery.includes('route') || lowerQuery.includes('trip') || lowerQuery.includes('travel')) {
      return websiteKnowledge.pages.routeHistory;
    }
    return websiteKnowledge.pages.searchHistory;
  }
  if (lowerQuery.includes('dashboard') || lowerQuery.includes('home') || lowerQuery.includes('stats')) {
    return websiteKnowledge.pages.dashboard;
  }
  if (lowerQuery.includes('weather') || lowerQuery.includes('temperature') || lowerQuery.includes('forecast')) {
    return websiteKnowledge.pages.weatherSearch;
  }
  
  return null;
};

// Helper to get smart suggestion based on context
export const getSmartSuggestion = (context) => {
  const suggestions = [];
  
  if (context.hasRoute && context.riskScore > 30) {
    suggestions.push({
      text: 'Compare Alternative Routes to find safer options',
      action: 'ALTERNATIVES'
    });
  }
  
  if (context.hasWeather && context.temp > 35) {
    suggestions.push({
      text: 'View detailed forecast for the week',
      action: 'FORECAST'
    });
  }
  
  return suggestions;
};