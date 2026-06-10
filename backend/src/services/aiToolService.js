// backend/src/services/aiToolService.js
import axios from 'axios';

class AIToolService {
  constructor() {
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  }

  async executeFunction(functionName, parameters, authToken) {
    const headers = {
  'Content-Type': 'application/json',
  'Authorization': authToken?.startsWith('Bearer ')
    ? authToken
    : `Bearer ${authToken}`
};

    switch (functionName) {
      case 'getWeather':
        return this.getWeather(parameters, headers);
      
      case 'getForecast':
        return this.getForecast(parameters, headers);
      
      case 'planRoute':
        return this.planRoute(parameters, headers);
      
      case 'getRouteAlternatives':
        return this.getRouteAlternatives(parameters, headers);
      
      case 'getAirQuality':
        return this.getAirQuality(parameters, headers);
      
      case 'getRouteWeatherRisk':
        return this.getRouteWeatherRisk(parameters, headers);
      
      case 'searchCities':
        return this.searchCities(parameters, headers);
      
      case 'getTravelRecommendation':
        return this.getTravelRecommendation(parameters, headers);
      
      default:
        return { error: `Unknown function: ${functionName}` };
    }
  }

  async getWeather(params, headers) {
    try {
      let lat, lon;
      
      if (params.city) {
        // Geocode the city first
        const geocodeResponse = await axios.get(`${this.backendUrl}/api/weather/search`, {
          params: { query: params.city },
          headers
        });
        
        if (geocodeResponse.data.data.cities && geocodeResponse.data.data.cities.length > 0) {
          lat = geocodeResponse.data.data.cities[0].lat;
          lon = geocodeResponse.data.data.cities[0].lon;
        } else {
          return { error: `City "${params.city}" not found` };
        }
      } else if (params.lat && params.lon) {
        lat = params.lat;
        lon = params.lon;
      } else {
        return { error: 'Either city name or coordinates are required' };
      }
      
      const response = await axios.get(`${this.backendUrl}/api/weather/current`, {
        params: { lat, lon },
        headers
      });
      
      const weather = response.data.data.weather;
      return {
        city: weather.city || params.city,
        country: weather.country,
        temperature: weather.temp,
        feelsLike: weather.feelsLike,
        condition: weather.condition,
        description: weather.description,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        pressure: weather.pressure,
        icon: weather.icon
      };
    } catch (error) {
      console.error('getWeather error:', error.message);
      return { error: 'Failed to fetch weather data' };
    }
  }

  async getForecast(params, headers) {
    try {
      const response = await axios.get(`${this.backendUrl}/api/weather/search`, {
        params: { query: params.city },
        headers
      });
      
      if (!response.data.data.cities || response.data.data.cities.length === 0) {
        return { error: `City "${params.city}" not found` };
      }
      
      const city = response.data.data.cities[0];
      const forecastResponse = await axios.get(`${this.backendUrl}/api/weather/forecast`, {
        params: { lat: city.lat, lon: city.lon },
        headers
      });
      
      return {
        city: params.city,
        forecast: forecastResponse.data.data.forecast
      };
    } catch (error) {
      console.error('getForecast error:', error.message);
      return { error: 'Failed to fetch forecast data' };
    }
  }

  async planRoute(params, headers) {
    try {
      const response = await axios.post(`${this.backendUrl}/api/routes/plan`, {
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        waypoints: params.waypoints || []
      }, { headers });
      
      const data = response.data.data;
      return {
        startLocation: data.locations.start.name,
        endLocation: data.locations.end.name,
        distance: data.route.distance,
        duration: data.route.duration,
        weatherAlongRoute: {
          riskScore: data.weatherAlongRoute?.riskAnalysis?.score,
          riskLevel: data.weatherAlongRoute?.riskAnalysis?.overall,
          recommendations: data.weatherAlongRoute?.riskAnalysis?.recommendations
        }
      };
    } catch (error) {
      console.error('planRoute error:', error.message);
      return { error: 'Failed to plan route' };
    }
  }

  async getRouteAlternatives(params, headers) {
    try {
      const response = await axios.post(`${this.backendUrl}/api/routes/alternatives`, {
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        waypoints: []
      }, { headers });
      
      const routes = response.data.data.routes;
      return {
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        alternatives: routes.map(r => ({
          name: r.name,
          distance: r.distance,
          duration: r.duration,
          weatherRisk: r.weatherRisk,
          weatherScore: r.weatherScore
        }))
      };
    } catch (error) {
      console.error('getRouteAlternatives error:', error.message);
      return { error: 'Failed to get route alternatives' };
    }
  }

  async getAirQuality(params, headers) {
    try {
      let lat, lon;
      
      if (params.city) {
        const geocodeResponse = await axios.get(`${this.backendUrl}/api/weather/search`, {
          params: { query: params.city },
          headers
        });
        
        if (geocodeResponse.data.data.cities && geocodeResponse.data.data.cities.length > 0) {
          lat = geocodeResponse.data.data.cities[0].lat;
          lon = geocodeResponse.data.data.cities[0].lon;
        } else {
          return { error: `City "${params.city}" not found` };
        }
      } else if (params.lat && params.lon) {
        lat = params.lat;
        lon = params.lon;
      } else {
        return { error: 'Either city name or coordinates are required' };
      }
      
      const response = await axios.get(`${this.backendUrl}/api/weather/all`, {
        params: { lat, lon },
        headers
      });
      
      const airQuality = response.data.data.airQuality;
      return airQuality || { message: 'Air quality data not available for this location' };
    } catch (error) {
      console.error('getAirQuality error:', error.message);
      return { error: 'Failed to fetch air quality data' };
    }
  }

  async getRouteWeatherRisk(params, headers) {
    try {
      const response = await axios.post(`${this.backendUrl}/api/routes/plan`, {
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        waypoints: []
      }, { headers });
      
      const riskAnalysis = response.data.data.weatherAlongRoute?.riskAnalysis;
      return {
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        riskScore: riskAnalysis?.score,
        riskLevel: riskAnalysis?.overall,
        warnings: riskAnalysis?.warnings,
        recommendations: riskAnalysis?.recommendations
      };
    } catch (error) {
      console.error('getRouteWeatherRisk error:', error.message);
      return { error: 'Failed to analyze route weather risk' };
    }
  }

  async searchCities(params, headers) {
    try {
      const response = await axios.get(`${this.backendUrl}/api/weather/search`, {
        params: { query: params.query },
        headers
      });
      
      return response.data.data.cities || [];
    } catch (error) {
      console.error('searchCities error:', error.message);
      return { error: 'Failed to search cities' };
    }
  }

  async getTravelRecommendation(params, headers) {
    try {
      const response = await axios.post(`${this.backendUrl}/api/routes/plan`, {
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        waypoints: []
      }, { headers });
      
      const riskAnalysis = response.data.data.weatherAlongRoute?.riskAnalysis;
      const weatherSummary = response.data.data.weatherAlongRoute?.summary;
      
      let recommendation = '';
      let isSafe = true;
      
      if (riskAnalysis?.score >= 60) {
        recommendation = '⚠️ High weather risk detected. Consider postponing your travel or choosing an alternative route.';
        isSafe = false;
      } else if (riskAnalysis?.score >= 30) {
        recommendation = '⚠️ Moderate weather risk. Drive with caution and be prepared for changing conditions.';
        isSafe = true;
      } else {
        recommendation = '✅ Weather conditions look favorable for travel. Safe journey!';
        isSafe = true;
      }
      
      return {
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        isSafe,
        recommendation,
        riskScore: riskAnalysis?.score,
        riskLevel: riskAnalysis?.overall,
        weatherSummary
      };
    } catch (error) {
      console.error('getTravelRecommendation error:', error.message);
      return { error: 'Failed to generate travel recommendation' };
    }
  }
}

export default new AIToolService();