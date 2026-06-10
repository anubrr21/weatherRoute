// frontend/src/utils/weatherUtils.js

/**
 * Get emoji icon for weather condition
 */
export const getWeatherIcon = (condition) => {
  const icons = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Smoke': '💨',
    'Haze': '🌫️'
  };
  return icons[condition] || '🌤️';
};

/**
 * Get Tailwind color class for weather risk
 */
export const getWeatherRiskColor = (condition) => {
  const colors = {
    'Clear': '#10B981', // green
    'Clouds': '#6B7280', // gray
    'Rain': '#3B82F6', // blue
    'Drizzle': '#60A5FA', // light blue
    'Thunderstorm': '#EF4444', // red
    'Snow': '#E5E7EB', // white
    'Mist': '#9CA3AF' // gray
  };
  return colors[condition] || '#6B7280';
};

/**
 * Get risk level text and color
 */
export const getRiskLevel = (riskScore) => {
  if (riskScore < 30) {
    return { text: 'Low Risk', color: 'text-green-600', bg: 'bg-green-100', icon: '✅' };
  } else if (riskScore < 60) {
    return { text: 'Moderate Risk', color: 'text-yellow-600', bg: 'bg-yellow-100', icon: '⚠️' };
  } else {
    return { text: 'High Risk', color: 'text-red-600', bg: 'bg-red-100', icon: '🚨' };
  }
};

/**
 * Format distance in km for display
 */
export const formatDistance = (km) => {
  if (km < 1) {
    return `${(km * 1000).toFixed(0)} m`;
  } else if (km < 100) {
    return `${km.toFixed(1)} km`;
  } else {
    return `${Math.round(km)} km`;
  }
};

/**
 * Get driving recommendation based on weather
 */
export const getDrivingRecommendation = (weather) => {
  const recommendations = [];
  
  if (weather.condition === 'Rain') {
    recommendations.push('🌧️ Reduce speed by 10-15 km/h on wet roads');
  }
  if (weather.windSpeed > 10) {
    recommendations.push('💨 Be cautious of crosswinds, especially on bridges');
  }
  if (weather.visibility < 2000) {
    recommendations.push('🌫️ Use fog lights and maintain extra distance');
  }
  if (weather.temp < 0) {
    recommendations.push('❄️ Watch for black ice on bridges and overpasses');
  }
  
  if (recommendations.length === 0) {
    return '✅ Good weather conditions for driving';
  }
  
  return recommendations;
};