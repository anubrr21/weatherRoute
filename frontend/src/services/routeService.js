// frontend/src/services/routeService.js
import api from './api';

/**
 * Route Service - Handles all route planning API calls
 */
const routeService = {
  /**
   * Plan a route between two or more locations
   * @param {Object} params - Route parameters
   * @param {string} params.startLocation - Starting location name/address
   * @param {string} params.endLocation - Destination location name/address
   * @param {Array} params.waypoints - Optional waypoints
   * @returns {Promise} Route data with geometry and weather
   */
  planRoute: async ({ startLocation, endLocation, waypoints = [] }) => {
    try {
      const response = await api.post('/routes/plan', {
        startLocation,
        endLocation,
        waypoints
      });
      return response.data.data;
    } catch (error) {
      console.error('Route planning error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get alternative routes between locations
   * @param {Object} params - Route parameters
   * @returns {Promise} Multiple route options
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
      console.error('Get alternatives error:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Get weather for a specific route geometry
   * @param {Object} params - { geometry, distance }
   * @returns {Promise} Weather data for the route
   */
  getWeatherForRouteGeometry: async ({ geometry, distance }) => {
    try {
      // Extract coordinates from geometry
      const coordinates = geometry.coordinates;
      const totalDistance = distance.meters;
      
      // Sample points along the route
      const sampleIndices = [];
      const numPoints = Math.min(7, Math.max(3, Math.ceil(coordinates.length / 20)));
      const step = Math.floor(coordinates.length / numPoints);
      
      for (let i = 0; i < coordinates.length; i += step) {
        sampleIndices.push(i);
      }
      if (sampleIndices[sampleIndices.length - 1] !== coordinates.length - 1) {
        sampleIndices.push(coordinates.length - 1);
      }
      
      // Fetch weather for each sample point
      const weatherPromises = sampleIndices.map(async (idx, pointIndex) => {
        const coord = coordinates[idx];
        const response = await api.get('/weather/current', {
          params: { lat: coord[1], lon: coord[0] }
        });
        
        const distanceFromStart = (idx / coordinates.length) * totalDistance;
        
        return {
          pointIndex,
          coordinates: { lat: coord[1], lng: coord[0] },
          distanceFromStart: distanceFromStart,
          distanceFromStartKm: (distanceFromStart / 1000).toFixed(1),
          weather: response.data.data.weather
        };
      });
      
      const points = await Promise.all(weatherPromises);
      
      // Calculate risk analysis (reuse existing logic)
      const riskAnalysis = calculateRiskAnalysis(points);
      const summary = generateWeatherSummary(points, totalDistance / 1000);
      
      return {
        points,
        riskAnalysis,
        summary
      };
    } catch (error) {
      console.error('Failed to get weather for route geometry:', error);
      return null;
    }
  }
};

// Helper: Calculate risk analysis
function calculateRiskAnalysis(weatherPoints) {
  let totalRiskScore = 0;
  const warnings = [];
  
  for (const point of weatherPoints) {
    const weather = point.weather;
    let pointRisk = 0;
    
    if (weather.condition === 'Rain') pointRisk += 30;
    else if (weather.condition === 'Drizzle') pointRisk += 15;
    else if (weather.condition === 'Thunderstorm') pointRisk += 40;
    
    if (weather.windSpeed > 15) pointRisk += 20;
    else if (weather.windSpeed > 10) pointRisk += 10;
    
    if (weather.visibility < 1000) pointRisk += 20;
    else if (weather.visibility < 5000) pointRisk += 10;
    
    if (weather.temp > 35 || weather.temp < 0) pointRisk += 10;
    
    totalRiskScore += pointRisk;
    
    if (pointRisk > 30) {
      warnings.push({
        distance: point.distanceFromStartKm,
        warnings: [`${weather.condition} at ${point.distanceFromStartKm}km`]
      });
    }
  }
  
  const avgRiskScore = totalRiskScore / weatherPoints.length;
  let overall = 'low';
  if (avgRiskScore >= 60) overall = 'high';
  else if (avgRiskScore >= 30) overall = 'moderate';
  
  const recommendations = [];
  if (avgRiskScore >= 60) recommendations.push('Poor weather conditions - consider postponing travel');
  else if (avgRiskScore >= 30) recommendations.push('Some adverse weather - drive with caution');
  else recommendations.push('Good weather conditions for travel');
  
  return { overall, score: avgRiskScore, warnings, recommendations };
}

// Helper: Generate weather summary
function generateWeatherSummary(weatherPoints, totalDistanceKm) {
  const conditions = weatherPoints.map(p => p.weather.condition);
  const temperatures = weatherPoints.map(p => p.weather.temp);
  const windSpeeds = weatherPoints.map(p => p.weather.windSpeed);
  
  const mostFrequent = conditions.sort((a,b) =>
    conditions.filter(v => v === a).length - conditions.filter(v => v === b).length
  ).pop();
  
  return {
    primaryCondition: mostFrequent,
    averageTemperature: Math.round(temperatures.reduce((a,b) => a + b, 0) / temperatures.length),
    temperatureRange: { min: Math.min(...temperatures), max: Math.max(...temperatures) },
    maxWindSpeed: Math.max(...windSpeeds),
    recommendation: mostFrequent === 'Rain' ? 'Pack rain gear' : 'Good driving conditions',
    totalCheckpoints: weatherPoints.length
  };
}

export default routeService;