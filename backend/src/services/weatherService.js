// backend/src/services/weatherService.js

import axios from 'axios';
import NodeCache from 'node-cache';

// Cache weather data for 10 minutes
const weatherCache = new NodeCache({ stdTTL: 600 });

class WeatherService {
  /**
   * Get current weather by coordinates
   */
  async getCurrentWeather(lat, lon) {
    const cacheKey = `current_${lat}_${lon}`;

    const cachedData = weatherCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get(
        'https://api.openweathermap.org/data/2.5/weather',
        {
          params: {
            lat,
            lon,
            appid: process.env.OPENWEATHER_API_KEY,
            units: 'metric'
          }
        }
      );

      const weatherData = this.formatCurrentWeather(response.data);
      weatherCache.set(cacheKey, weatherData);

      return weatherData;
    } catch (error) {
      console.error(
        'Error fetching current weather:',
        error.response?.data || error.message
      );
      throw new Error('Failed to fetch current weather data');
    }
  }

  /**
   * Get 5-day forecast
   */
  async getForecast(lat, lon) {
    const cacheKey = `forecast_${lat}_${lon}`;

    const cachedData = weatherCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get(
        'https://api.openweathermap.org/data/2.5/forecast',
        {
          params: {
            lat,
            lon,
            appid: process.env.OPENWEATHER_API_KEY,
            units: 'metric'
          }
        }
      );

      const forecastData = this.formatForecastData(response.data);
      weatherCache.set(cacheKey, forecastData);

      return forecastData;
    } catch (error) {
      console.error(
        'Error fetching forecast:',
        error.response?.data || error.message
      );
      throw new Error('Failed to fetch forecast data');
    }
  }

  /**
   * Get Air Quality Index (AQI)
   */
  async getAirQuality(lat, lon) {
    const cacheKey = `aqi_${lat}_${lon}`;

    const cachedData = weatherCache.get(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    try {
      const response = await axios.get(
        'https://api.openweathermap.org/data/2.5/air_pollution',
        {
          params: {
            lat,
            lon,
            appid: process.env.OPENWEATHER_API_KEY
          }
        }
      );

      const aqiData = this.formatAirQuality(response.data);
      weatherCache.set(cacheKey, aqiData);

      return aqiData;
    } catch (error) {
      console.error(
        'Error fetching air quality:',
        error.response?.data || error.message
      );
      return null;
    }
  }

  /**
   * Search cities
   */
  async searchCities(query) {
    try {
      const response = await axios.get(
        'https://api.openweathermap.org/geo/1.0/direct',
        {
          params: {
            q: query,
            limit: 5,
            appid: process.env.OPENWEATHER_API_KEY
          }
        }
      );

      return response.data.map(city => ({
        name: city.name,
        country: city.country,
        state: city.state,
        lat: city.lat,
        lon: city.lon
      }));
    } catch (error) {
      console.error(
        'Error searching cities:',
        error.response?.data || error.message
      );
      return [];
    }
  }
  // backend/src/services/weatherService.js
// Add these new methods to the existing WeatherService class

  /**
   * Get weather at multiple points along a route
   * @param {Array} routeGeometry - GeoJSON geometry from Mapbox
   * @param {number} totalDistanceKm - Total route distance in km
   * @returns {Array} Weather data at multiple points
   */
  async getWeatherAlongRoute(routeGeometry, totalDistanceKm) {
    try {
      // Extract coordinates from GeoJSON
      const coordinates = this.extractCoordinatesFromGeometry(routeGeometry);
      
      if (!coordinates || coordinates.length === 0) {
        throw new Error('Invalid route geometry');
      }
      
      // Determine how many weather points to sample (every ~100-150km)
      const intervalKm = Math.min(150, Math.max(100, totalDistanceKm / 5));
      const numberOfPoints = Math.min(10, Math.max(3, Math.ceil(totalDistanceKm / intervalKm)));
      
      // Calculate sampling indices
      const indices = this.calculateSamplingIndices(coordinates.length, numberOfPoints);
      
      // Fetch weather for each sampled point in parallel
      const weatherPromises = indices.map(async (index, i) => {
        const coord = coordinates[index];
        const distanceFromStart = this.calculateDistanceAlongRoute(coordinates, index);
        
        try {
          const weather = await this.getCurrentWeather(coord[1], coord[0]);
          return {
            pointIndex: i,
            coordinates: { lat: coord[1], lng: coord[0] },
            distanceFromStart: distanceFromStart,
            distanceFromStartKm: (distanceFromStart / 1000).toFixed(1),
            weather: weather,
            timestamp: new Date().toISOString()
          };
        } catch (error) {
          console.error(`Failed to get weather at point ${i}:`, error.message);
          return null;
        }
      });
      
      const weatherPoints = (await Promise.all(weatherPromises)).filter(point => point !== null);
      
      // Analyze weather risks along the route
      const riskAnalysis = this.analyzeRouteWeatherRisks(weatherPoints);
      
      return {
        points: weatherPoints,
        riskAnalysis,
        summary: this.generateWeatherSummary(weatherPoints, totalDistanceKm)
      };
      
    } catch (error) {
      console.error('Error getting weather along route:', error);
      throw new Error('Failed to get weather data along route');
    }
  }
  
  /**
   * Extract coordinates from GeoJSON geometry
   */
  extractCoordinatesFromGeometry(geometry) {
    if (geometry.type === 'LineString') {
      return geometry.coordinates;
    } else if (geometry.type === 'MultiLineString') {
      // Take the longest line for MultiLineString
      const lines = geometry.coordinates;
      const longestLine = lines.reduce((longest, current) => 
        current.length > longest.length ? current : longest, lines[0]);
      return longestLine;
    }
    return null;
  }
  
  /**
   * Calculate sampling indices along the route
   */
  calculateSamplingIndices(totalPoints, numberOfPoints) {
    if (numberOfPoints >= totalPoints) {
      return Array.from({ length: totalPoints }, (_, i) => i);
    }
    
    const indices = [];
    const step = (totalPoints - 1) / (numberOfPoints - 1);
    
    for (let i = 0; i < numberOfPoints; i++) {
      indices.push(Math.round(i * step));
    }
    
    return indices;
  }
  
  /**
   * Calculate distance along route from start to a point
   */
  calculateDistanceAlongRoute(coordinates, targetIndex) {
    let totalDistance = 0;
    
    for (let i = 1; i <= targetIndex; i++) {
      const prev = coordinates[i - 1];
      const curr = coordinates[i];
      totalDistance += this.calculateHaversineDistance(prev[1], prev[0], curr[1], curr[0]);
    }
    
    return totalDistance;
  }
  
  /**
   * Calculate distance between two points using Haversine formula
   */
  calculateHaversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  toRad(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  /**
   * Analyze weather risks along the route
   */
  analyzeRouteWeatherRisks(weatherPoints) {
    const risks = {
      overall: 'low',
      score: 0,
      warnings: [],
      recommendations: []
    };
    
    let totalRiskScore = 0;
    
    for (const point of weatherPoints) {
      const weather = point.weather;
      const pointRisk = this.calculatePointRisk(weather);
      totalRiskScore += pointRisk.score;
      
      if (pointRisk.warnings.length > 0) {
        risks.warnings.push({
          distance: point.distanceFromStartKm,
          warnings: pointRisk.warnings
        });
      }
    }
    
    // Calculate average risk score (0-100)
    risks.score = totalRiskScore / weatherPoints.length;
    
    // Determine overall risk level
    if (risks.score < 30) {
      risks.overall = 'low';
      risks.recommendations.push('Good weather conditions for travel');
    } else if (risks.score < 60) {
      risks.overall = 'moderate';
      risks.recommendations.push('Some adverse weather conditions expected. Drive with caution.');
    } else {
      risks.overall = 'high';
      risks.recommendations.push('Poor weather conditions expected. Consider postponing travel if possible.');
    }
    
    // Add specific recommendations based on weather
    if (this.hasHeavyRain(weatherPoints)) {
      risks.recommendations.push('Heavy rain expected - reduce speed and increase following distance');
    }
    if (this.hasStrongWinds(weatherPoints)) {
      risks.recommendations.push('Strong winds detected - be cautious of crosswinds, especially for high-profile vehicles');
    }
    if (this.hasLowVisibility(weatherPoints)) {
      risks.recommendations.push('Low visibility conditions - use fog lights and maintain safe distance');
    }
    if (this.hasExtremeTemperatures(weatherPoints)) {
      risks.recommendations.push('Extreme temperatures - ensure vehicle is properly maintained');
    }
    
    return risks;
  }
  
  /**
   * Calculate risk score for a single weather point
   */
  calculatePointRisk(weather) {
    let score = 0;
    const warnings = [];
    
    // Rain risk (0-40 points)
    if (weather.condition === 'Rain') {
      score += 30;
      warnings.push('Rain expected');
    } else if (weather.condition === 'Drizzle') {
      score += 15;
      warnings.push('Light rain possible');
    } else if (weather.condition === 'Thunderstorm') {
      score += 40;
      warnings.push('⚠️ Thunderstorm warning!');
    }
    
    // Wind risk (0-30 points)
    if (weather.windSpeed > 15) {
      score += 20;
      warnings.push(`Strong winds (${weather.windSpeed} m/s)`);
    } else if (weather.windSpeed > 10) {
      score += 10;
      warnings.push(`Moderate winds (${weather.windSpeed} m/s)`);
    }
    
    // Visibility risk (0-20 points)
    if (weather.visibility < 1000) {
      score += 20;
      warnings.push('Very poor visibility (<1km)');
    } else if (weather.visibility < 5000) {
      score += 10;
      warnings.push('Reduced visibility');
    }
    
    // Temperature extremes (0-10 points)
    if (weather.temp > 35) {
      score += 10;
      warnings.push(`Extreme heat (${weather.temp}°C)`);
    } else if (weather.temp < 0) {
      score += 10;
      warnings.push(`Freezing temperatures (${weather.temp}°C)`);
    }
    
    return { score: Math.min(100, score), warnings };
  }
  
  /**
   * Check for heavy rain along route
   */
  hasHeavyRain(weatherPoints) {
    return weatherPoints.some(point => 
      point.weather.condition === 'Thunderstorm' || 
      (point.weather.condition === 'Rain' && point.weather.description?.includes('heavy'))
    );
  }
  
  /**
   * Check for strong winds along route
   */
  hasStrongWinds(weatherPoints) {
    return weatherPoints.some(point => point.weather.windSpeed > 12);
  }
  
  /**
   * Check for low visibility conditions
   */
  hasLowVisibility(weatherPoints) {
    return weatherPoints.some(point => 
      point.weather.visibility < 2000 || 
      ['Mist', 'Fog', 'Smoke'].includes(point.weather.condition)
    );
  }
  
  /**
   * Check for extreme temperatures
   */
  hasExtremeTemperatures(weatherPoints) {
    return weatherPoints.some(point => point.weather.temp > 35 || point.weather.temp < -5);
  }
  
  /**
   * Generate weather summary for the route
   */
  generateWeatherSummary(weatherPoints, totalDistanceKm) {
    const conditions = weatherPoints.map(p => p.weather.condition);
    const temperatures = weatherPoints.map(p => p.weather.temp);
    const windSpeeds = weatherPoints.map(p => p.weather.windSpeed);
    
    const mostFrequentCondition = this.getMostFrequent(conditions);
    const avgTemp = temperatures.reduce((a, b) => a + b, 0) / temperatures.length;
    const maxWind = Math.max(...windSpeeds);
    const tempRange = {
      min: Math.min(...temperatures),
      max: Math.max(...temperatures)
    };
    
    let recommendation = '';
    if (mostFrequentCondition === 'Rain' || mostFrequentCondition === 'Thunderstorm') {
      recommendation = 'Pack rain gear and drive carefully';
    } else if (mostFrequentCondition === 'Clear') {
      recommendation = 'Perfect weather for a road trip!';
    } else {
      recommendation = 'Variable conditions - prepare for different weather';
    }
    
    return {
      primaryCondition: mostFrequentCondition,
      averageTemperature: Math.round(avgTemp),
      temperatureRange: tempRange,
      maxWindSpeed: maxWind,
      recommendation,
      totalCheckpoints: weatherPoints.length
    };
  }

  /**
   * Format current weather data
   */
  formatCurrentWeather(data) {
    return {
      temp: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      pressure: data.main.pressure,
      windSpeed: data.wind.speed,
      windDeg: data.wind.deg,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
      visibility: data.visibility,
      clouds: data.clouds.all,
      city: data.name,
      country: data.sys.country
    };
  }

  /**
   * Format forecast data
   */
  formatForecastData(data) {
    const dailyForecasts = {};

    data.list.forEach(item => {
      const date = new Date(item.dt * 1000);
      const day = date.toLocaleDateString('en-US', {
        weekday: 'short'
      });
      const fullDate = date.toISOString().split('T')[0];

      if (!dailyForecasts[fullDate]) {
        dailyForecasts[fullDate] = {
          day,
          date: fullDate,
          temps: [],
          conditions: [],
          icons: [],
          humidity: [],
          windSpeed: [],
          rainProbability: 0
        };
      }

      dailyForecasts[fullDate].temps.push(item.main.temp);
      dailyForecasts[fullDate].conditions.push(item.weather[0].main);
      dailyForecasts[fullDate].icons.push(item.weather[0].icon);
      dailyForecasts[fullDate].humidity.push(item.main.humidity);
      dailyForecasts[fullDate].windSpeed.push(item.wind.speed);

      if (item.pop) {
        dailyForecasts[fullDate].rainProbability = Math.max(
          dailyForecasts[fullDate].rainProbability,
          item.pop * 100
        );
      }
    });

    return Object.values(dailyForecasts)
      .slice(0, 5)
      .map(day => ({
        day: day.day,
        date: day.date,
        tempHigh: Math.max(...day.temps),
        tempLow: Math.min(...day.temps),
        tempAvg:
          day.temps.reduce((a, b) => a + b, 0) /
          day.temps.length,
        condition: this.getMostFrequent(day.conditions),
        icon: day.icons[Math.floor(day.icons.length / 2)],
        humidity: Math.round(
          day.humidity.reduce((a, b) => a + b, 0) /
            day.humidity.length
        ),
        windSpeed: Math.round(
          day.windSpeed.reduce((a, b) => a + b, 0) /
            day.windSpeed.length
        ),
        rainProbability: Math.round(day.rainProbability)
      }));
  }

  /**
   * Format AQI
   */
  formatAirQuality(data) {
    const aqi = data.list[0].main.aqi;

    return {
      aqi,
      components: data.list[0].components
    };
  }

  /**
   * Helper
   */
  getMostFrequent(arr) {
    return arr
      .sort(
        (a, b) =>
          arr.filter(v => v === a).length -
          arr.filter(v => v === b).length
      )
      .pop();
  }
}

export default new WeatherService();