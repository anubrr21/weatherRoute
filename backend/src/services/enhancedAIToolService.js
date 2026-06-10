// backend/src/services/enhancedAIToolService.js
import axios from 'axios';

class EnhancedAIToolService {
  constructor() {
    this.backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
  }

  // Helper function to parse date references
  parseDateReference(dateReference) {
    if (!dateReference || dateReference === 'today') {
      return { type: 'today', date: new Date() };
    }
    
    const today = new Date();
    const lowerRef = dateReference.toLowerCase();
    
    if (lowerRef === 'tomorrow') {
      const date = new Date(today);
      date.setDate(today.getDate() + 1);
      return { type: 'tomorrow', date };
    }
    
    if (lowerRef === 'day after tomorrow') {
      const date = new Date(today);
      date.setDate(today.getDate() + 2);
      return { type: 'dayAfter', date };
    }
    
    if (lowerRef === 'this weekend') {
      const date = new Date(today);
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
      date.setDate(today.getDate() + daysUntilSaturday);
      return { type: 'weekend', date };
    }
    
    if (lowerRef === 'next weekend') {
      const date = new Date(today);
      const daysUntilNextSaturday = (6 - today.getDay() + 14) % 7;
      date.setDate(today.getDate() + daysUntilNextSaturday);
      return { type: 'weekend', date };
    }
    
    // Check for specific weekdays like "next Monday"
    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    for (let i = 0; i < weekdays.length; i++) {
      if (lowerRef.includes(weekdays[i])) {
        const targetDay = i;
        let daysToAdd = (targetDay - today.getDay() + 7) % 7;
        if (daysToAdd === 0) daysToAdd = 7;
        const date = new Date(today);
        date.setDate(today.getDate() + daysToAdd);
        return { type: 'weekday', date, weekday: weekdays[i] };
      }
    }
    
    return { type: 'today', date: today };
  }

  async executeFunction(functionName, parameters, authToken) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': authToken
    };

    switch (functionName) {
      case 'getWeather':
        return this.getEnhancedWeather(parameters, headers);
      case 'getForecast':
        return this.getEnhancedForecast(parameters, headers);
      case 'planRoute':
        return this.getEnhancedRoute(parameters, headers);
      case 'getRouteAlternatives':
        return this.getEnhancedAlternatives(parameters, headers);
      case 'getTravelRecommendation':
        return this.getEnhancedTravelRecommendation(parameters, headers);
      case 'getWebsiteInfo':
        return this.getWebsiteInfo(parameters, headers);
      case 'suggestFeature':
        return this.suggestFeature(parameters, headers);
      case 'findNearbyAmenities':
        return this.findNearbyAmenities(parameters, headers);
      default:
        return { error: `Unknown function: ${functionName}` };
    }
  }

  async getWebsiteInfo(params, headers) {
    const query = params.query?.toLowerCase() || '';
    
    const infoMap = {
      'route history': { page: 'routeHistory', description: 'Route History shows all your past planned routes with distance, duration, and weather data.' },
      'search history': { page: 'searchHistory', description: 'Search History shows all your past weather searches with timestamps and weather conditions.' },
      'favorites': { page: 'favorites', description: 'Favorites lets you save locations for quick weather access.' },
      'dashboard': { page: 'dashboard', description: 'Dashboard shows your activity summary, favorites, and search statistics.' },
      'route planner': { page: 'routePlanner', description: 'Route Planner helps you plan trips with weather checkpoints and risk analysis.' },
      'alternative routes': { page: 'routePlanner', description: 'Alternative Routes are available in Route Planner after planning a route.' }
    };
    
    for (const [key, value] of Object.entries(infoMap)) {
      if (query.includes(key)) {
        return {
          found: true,
          page: value.page,
          description: value.description,
          action: `[ACTION:NAVIGATE:${value.page}]`
        };
      }
    }
    
    return {
      found: false,
      suggestion: 'Try using the navigation bar or Dashboard to explore WeatherRoute features.'
    };
  }

  async suggestFeature(params, headers) {
    const context = params.context?.toLowerCase() || '';
    
    if (context.includes('route')) {
      return {
        feature: 'Alternative Routes',
        description: 'Compare different route options with weather risk scores',
        action: '[ACTION:SUGGEST:alternatives]',
        message: '💡 You can compare Alternative Routes in the Route Planner to find the safest option!'
      };
    }
    
    if (context.includes('weather')) {
      return {
        feature: '5-Day Forecast',
        description: 'View detailed weather forecast for the week',
        action: '[ACTION:SUGGEST:forecast]',
        message: '💡 Want a detailed forecast? Open the Weather Details page for 5-day predictions!'
      };
    }
    
    if (context.includes('history')) {
      return {
        feature: 'Route History',
        description: 'View all your past planned routes',
        action: '[ACTION:NAVIGATE:routeHistory]',
        message: '💡 Check your Route History to see all your past trips!'
      };
    }
    
    return {
      feature: 'Dashboard',
      description: 'View your activity summary',
      action: '[ACTION:NAVIGATE:dashboard]',
      message: '💡 Visit your Dashboard to see your travel statistics!'
    };
  }

  async getEnhancedWeather(params, headers) {
    try {
      let dateInfo = null;
      if (params.dateReference) {
        dateInfo = this.parseDateReference(params.dateReference);
      }
      
      const response = await axios.get(`${this.backendUrl}/api/weather/search`, {
        params: { query: params.city },
        headers
      });
      
      if (!response.data.data.cities || response.data.data.cities.length === 0) {
        return { error: `City "${params.city}" not found` };
      }
      
      const city = response.data.data.cities[0];
      
      // If date reference is not today, get forecast
      if (dateInfo && dateInfo.type !== 'today') {
        const forecastResponse = await axios.get(`${this.backendUrl}/api/weather/forecast`, {
          params: { lat: city.lat, lon: city.lon },
          headers
        });
        
        const forecast = forecastResponse.data.data.forecast;
        
        // FIX: Calculate day index with bounds checking
        let dayIndex = 0;
        if (dateInfo.type === 'tomorrow') {
          dayIndex = 1;
        } else if (dateInfo.type === 'dayAfter') {
          dayIndex = 2;
        }
        
        // FIX: Check if forecast has enough days
        if (forecast && forecast.length > dayIndex && forecast[dayIndex]) {
          const targetDay = forecast[dayIndex];
          return {
            city: params.city,
            date: params.dateReference,
            temperature: targetDay.tempAvg,
            condition: targetDay.condition,
            humidity: targetDay.humidity,
            windSpeed: targetDay.windSpeed,
            rainProbability: targetDay.rainProbability,
            isForecast: true,
            forecastDate: dateInfo.date?.toLocaleDateString('en-IN')
          };
        } else {
          // Fallback to current weather if forecast not available
          console.log(`Forecast for ${params.dateReference} not available, using current weather`);
        }
      }
      
      const weatherResponse = await axios.get(`${this.backendUrl}/api/weather/current`, {
        params: { lat: city.lat, lon: city.lon },
        headers
      });
      
      const weather = weatherResponse.data.data.weather;
      
      let comfortAdvice = '';
      let clothingAdvice = '';
      
      if (weather.temp > 35) {
        comfortAdvice = 'Extremely hot! 🥵';
        clothingAdvice = 'Light cotton clothes, sunglasses, hat. Carry water!';
      } else if (weather.temp > 30) {
        comfortAdvice = 'Hot and sunny ☀️';
        clothingAdvice = 'Light clothing, sunscreen recommended';
      } else if (weather.temp > 20) {
        comfortAdvice = 'Pleasant and comfortable 😊';
        clothingAdvice = 'Light clothing works perfectly';
      } else if (weather.temp > 10) {
        comfortAdvice = 'Cool and fresh 🍂';
        clothingAdvice = 'Carry a light jacket or sweater';
      } else {
        comfortAdvice = 'Cold! ❄️';
        clothingAdvice = 'Wear heavy clothing, gloves, and a cap';
      }
      
      if (weather.condition === 'Rain') {
        comfortAdvice += ' 🌧️ Raining!';
        clothingAdvice = 'Carry an umbrella and wear waterproof shoes';
      } else if (weather.condition === 'Thunderstorm') {
        comfortAdvice += ' ⛈️ Thunderstorm!';
        clothingAdvice = 'Stay indoors if possible';
      }
      
      return {
        city: weather.city || params.city,
        country: weather.country,
        temperature: weather.temp,
        feelsLike: weather.feelsLike,
        condition: weather.condition,
        description: weather.description,
        humidity: weather.humidity,
        windSpeed: weather.windSpeed,
        comfortAdvice,
        clothingAdvice,
        date: dateInfo?.type === 'today' ? 'today' : 'today',
        isForecast: false
      };
    } catch (error) {
      console.error('getEnhancedWeather error:', error.message);
      return { error: 'Failed to fetch weather data' };
    }
  }

  async getEnhancedForecast(params, headers) {
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
      
      const forecast = forecastResponse.data.data.forecast;
      const daysToShow = Math.min(params.days || 5, forecast.length);
      
      const enhancedForecast = forecast.slice(0, daysToShow).map((day, idx) => {
        let recommendation = '';
        let advice = '';
        
        if (day.condition === 'Rain') {
          recommendation = 'Carry umbrella, indoor activities recommended';
          advice = '🌧️ Rain expected - plan indoor activities';
        } else if (day.tempAvg > 35) {
          recommendation = 'Stay hydrated, avoid noon sun';
          advice = '🥵 Very hot - stay indoors 12-3 PM';
        } else if (day.tempAvg < 15) {
          recommendation = 'Wear warm clothes';
          advice = '❄️ Cool weather - carry a jacket';
        } else {
          recommendation = 'Perfect day for outdoor plans!';
          advice = '✅ Great weather for travel';
        }
        
        const dayName = idx === 0 ? 'Tomorrow' : 
                       idx === 1 ? 'Day after' : 
                       `Day ${idx + 1}`;
        
        return {
          ...day,
          dayName,
          recommendation,
          advice
        };
      });
      
      return {
        city: params.city,
        forecast: enhancedForecast
      };
    } catch (error) {
      console.error('getEnhancedForecast error:', error.message);
      return { error: 'Failed to fetch forecast data' };
    }
  }

  async getEnhancedRoute(params, headers) {
    try {
      const response = await axios.post(`${this.backendUrl}/api/routes/plan`, {
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        waypoints: params.waypoints || []
      }, { headers });
      
      const data = response.data.data;
      const distanceKm = data.route.distance?.kilometers || (data.route.distance?.meters / 1000);
      const durationHours = data.route.duration?.hours || (data.route.duration?.minutes / 60);
      
      // Calculate detailed rest stops
      const restStops = [];
      const fuelStops = [];
      const foodSpots = [];
      const checkpointInterval = 120; // km between rest stops
      const numStops = Math.floor(distanceKm / checkpointInterval);
      
      if (data.weatherAlongRoute?.points && data.weatherAlongRoute.points.length > 0) {
        for (let i = 1; i <= Math.min(numStops, 5); i++) {
          const targetKm = i * checkpointInterval;
          const closestPoint = data.weatherAlongRoute.points.reduce((prev, curr) => {
            const prevDiff = Math.abs(prev.distanceFromStartKm - targetKm);
            const currDiff = Math.abs(curr.distanceFromStartKm - targetKm);
            return currDiff < prevDiff ? curr : prev;
          });
          
          if (closestPoint && closestPoint.weather) {
            const cityName = closestPoint.weather.city || `Checkpoint ${i}`;
            restStops.push({
              location: cityName,
              distanceKm: Math.round(closestPoint.distanceFromStartKm),
              weather: closestPoint.weather.condition,
              temp: closestPoint.weather.temp,
              advice: this.getRestStopAdvice(closestPoint.weather),
              hasFuel: i % 2 === 0,
              hasFood: true,
              localSpecialty: i === 1 ? 'Local snacks available' : 'Restaurant options'
            });
            
            fuelStops.push({
              location: cityName,
              distanceKm: Math.round(closestPoint.distanceFromStartKm),
              type: 'Petrol pump available'
            });
            
            foodSpots.push({
              location: cityName,
              distanceKm: Math.round(closestPoint.distanceFromStartKm),
              cuisine: 'Multi-cuisine available'
            });
          }
        }
      }
      
      const bestDeparture = this.getBestDepartureTime(data.weatherAlongRoute);
      const packingRecommendations = this.getPackingRecommendations(data.weatherAlongRoute);
      const advisories = this.getTravelAdvisories(data.weatherAlongRoute);
      
      // FIX: REMOVED travelDate from response - this was causing "travelDate=today" to appear as waypoint
      return {
        success: true,
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        distance: {
          km: Math.round(distanceKm),
          miles: Math.round(distanceKm * 0.621371),
          text: data.route.distance?.text
        },
        duration: {
          hours: Math.floor(durationHours),
          minutes: Math.round((durationHours % 1) * 60),
          text: data.route.duration?.text
        },
        weatherPoints: data.weatherAlongRoute?.points?.slice(0, 5).map((p, idx) => ({
          location: p.weather?.city || `Point ${idx + 1}`,
          distanceKm: p.distanceFromStartKm,
          condition: p.weather?.condition,
          temp: p.weather?.temp,
          windSpeed: p.weather?.windSpeed,
          visibility: p.weather?.visibility,
          advice: this.getDrivingAdvice(p.weather)
        })) || [],
        restStops,
        fuelStops,
        foodSpots,
        riskAnalysis: data.weatherAlongRoute?.riskAnalysis,
        bestDepartureTime: bestDeparture,
        packingRecommendations,
        advisories,
        scenicSpots: this.getScenicSpots(params.startLocation, params.endLocation),
        travelTips: this.getTravelTips(data.weatherAlongRoute?.riskAnalysis, distanceKm, durationHours)
      };
    } catch (error) {
      console.error('getEnhancedRoute error:', error.message);
      return { error: 'Failed to plan route. Please check the city names and try again.' };
    }
  }

  getPackingRecommendations(weatherAlongRoute) {
    const recommendations = [];
    const temps = weatherAlongRoute?.points?.map(p => p.weather?.temp) || [];
    const conditions = weatherAlongRoute?.points?.map(p => p.weather?.condition) || [];
    
    const avgTemp = temps.reduce((a, b) => a + b, 0) / (temps.length || 1);
    
    if (avgTemp > 30) {
      recommendations.push('🕶️ Sunglasses and sunscreen');
      recommendations.push('🧢 Cap or hat');
      recommendations.push('💧 Water bottle');
    } else if (avgTemp < 15) {
      recommendations.push('🧥 Warm jacket');
      recommendations.push('🧣 Scarf and gloves');
      recommendations.push('☕ Thermos for hot drinks');
    }
    
    if (conditions.includes('Rain')) {
      recommendations.push('🌂 Umbrella');
      recommendations.push('👢 Waterproof shoes');
      recommendations.push('🧥 Raincoat');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('👕 Comfortable driving clothes');
      recommendations.push('📱 Phone charger');
    }
    
    return recommendations;
  }

  getTravelAdvisories(weatherAlongRoute) {
    const advisories = [];
    const conditions = weatherAlongRoute?.points?.map(p => p.weather?.condition) || [];
    const visibilities = weatherAlongRoute?.points?.map(p => p.weather?.visibility) || [];
    const windSpeeds = weatherAlongRoute?.points?.map(p => p.weather?.windSpeed) || [];
    
    if (conditions.includes('Fog') || conditions.includes('Mist')) {
      advisories.push('🌫️ Fog expected - use fog lights and maintain distance');
    }
    
    if (conditions.includes('Thunderstorm')) {
      advisories.push('⛈️ Thunderstorm warning - avoid travel if possible');
    }
    
    if (Math.max(...visibilities) < 2000) {
      advisories.push('👁️ Low visibility conditions - drive slowly');
    }
    
    if (Math.max(...windSpeeds) > 15) {
      advisories.push('💨 Strong winds - hold steering firmly, especially on bridges');
    }
    
    return advisories;
  }

  getRestStopAdvice(weather) {
    if (weather.condition === 'Rain') return 'Find covered parking, good for a coffee break ☕';
    if (weather.temp > 35) return 'AC break recommended, grab cold drinks 🧊';
    if (weather.temp < 15) return 'Good spot for hot tea/coffee ☕';
    return 'Nice weather for a stretch break 🚶';
  }

  getDrivingAdvice(weather) {
    if (weather.condition === 'Rain') return '⚠️ Reduce speed, wet roads';
    if (weather.condition === 'Thunderstorm') return '⚠️⚠️ Consider waiting it out';
    if (weather.windSpeed > 10) return '💨 Strong winds, hold steering firmly';
    if (weather.visibility < 2000) return '🌫️ Low visibility, use fog lights';
    return '✅ Good driving conditions';
  }

  getBestDepartureTime(weatherAlongRoute) {
    const morningConditions = ['Clear', 'Clouds'];
    const isMorningGood = weatherAlongRoute?.points?.slice(0, 3).every(p => 
      morningConditions.includes(p.weather?.condition)
    );
    
    if (isMorningGood) {
      return {
        time: '6:00 AM - 8:00 AM',
        reason: 'Best weather conditions expected in the morning',
        advice: 'Start early to enjoy smooth driving and avoid afternoon heat'
      };
    }
    
    return {
      time: '10:00 AM - 11:00 AM',
      reason: 'Allows time for morning fog or rain to clear',
      advice: 'Check weather radar before departing'
    };
  }

  getScenicSpots(start, end) {
    const commonSpots = [
      { name: 'Scenic Viewpoint', description: 'Great photo opportunity 📸', stopDuration: '15-20 min' },
      { name: 'Rest Area with View', description: 'Clean restrooms and scenic overlook', stopDuration: '10-15 min' }
    ];
    return commonSpots;
  }

  getTravelTips(riskAnalysis, distanceKm, durationHours) {
    const tips = [];
    
    if (riskAnalysis?.score >= 60) {
      tips.push('⚠️ HIGH WEATHER RISK - Consider postponing or taking alternative route');
      tips.push('📞 Keep emergency contacts handy');
      tips.push('🔋 Charge your phone fully before departure');
    } else if (riskAnalysis?.score >= 30) {
      tips.push('⚠️ Moderate weather risk - Drive with caution');
      tips.push('📻 Check weather updates every 2 hours');
    } else {
      tips.push('✅ Weather conditions are favorable - Enjoy your drive!');
    }
    
    if (distanceKm > 300) {
      const stopsCount = Math.floor(distanceKm / 150);
      tips.push(`🛑 Plan ${stopsCount} rest stops along the way - every 2-3 hours`);
      tips.push('💧 Carry sufficient water and energy snacks');
      tips.push('🎵 Create a driving playlist for entertainment');
    }
    
    if (durationHours > 4) {
      tips.push('👥 Consider a co-driver for shift driving on long trips');
      tips.push('☕ Plan coffee breaks to stay alert');
    }
    
    tips.push('🚗 Check tire pressure, fuel, and coolant before departure');
    tips.push('📱 Share your live location with family/friends');
    
    return tips;
  }

  async getEnhancedAlternatives(params, headers) {
    try {
      const response = await axios.post(`${this.backendUrl}/api/routes/alternatives`, {
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        waypoints: []
      }, { headers });
      
      const routes = response.data.data.routes;
      
      const enhancedAlternatives = routes.map(r => ({
        name: r.name,
        distance: r.distance?.text || `${Math.round(r.distance?.meters / 1000)} km`,
        duration: r.duration?.text || `${Math.round(r.duration?.minutes)} min`,
        weatherRisk: r.weatherRisk,
        weatherScore: r.weatherScore,
        recommendation: this.getAlternativeRecommendation(r.weatherRisk)
      }));
      
      const bestRoute = enhancedAlternatives.reduce((best, current) => 
        (current.weatherScore < best.weatherScore) ? current : best, enhancedAlternatives[0]
      );
      
      return {
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        alternatives: enhancedAlternatives,
        recommendation: `✨ I recommend the ${bestRoute.name} - it has the lowest weather risk. ${bestRoute.recommendation}`,
        bestRouteName: bestRoute.name
      };
    } catch (error) {
      console.error('getEnhancedAlternatives error:', error.message);
      return { error: 'Failed to get alternatives' };
    }
  }

  getAlternativeRecommendation(risk) {
    if (risk === 'low') return 'Safest option weather-wise ✅';
    if (risk === 'moderate') return 'Acceptable but drive carefully ⚠️';
    return 'High weather risk - consider other options 🚨';
  }

  async getEnhancedTravelRecommendation(params, headers) {
    try {
      const routeData = await this.getEnhancedRoute(params, headers);
      
      if (routeData.error) {
        return routeData;
      }
      
      const riskScore = routeData.riskAnalysis?.score || 0;
      let verdict = '';
      let detailedAdvice = '';
      let emoji = '';
      
      if (riskScore < 30) {
        verdict = '✅ SAFE TO TRAVEL';
        emoji = '🌟';
        detailedAdvice = `Perfect conditions for your trip from ${params.startLocation} to ${params.endLocation}! The weather looks beautiful along the entire route.`;
      } else if (riskScore < 60) {
        verdict = '⚠️ PROCEED WITH CAUTION';
        emoji = '⚠️';
        detailedAdvice = `Travel is possible from ${params.startLocation} to ${params.endLocation}, but be careful. Pack an umbrella and raincoat just in case.`;
      } else {
        verdict = '🚨 NOT RECOMMENDED';
        emoji = '🚨';
        detailedAdvice = `Strongly advise postponing your trip from ${params.startLocation} to ${params.endLocation}. If you must travel, drive extremely slowly and take frequent breaks.`;
      }
      
      return {
        startLocation: params.startLocation,
        endLocation: params.endLocation,
        verdict,
        emoji,
        riskScore,
        detailedAdvice,
        bestTimeToLeave: routeData.bestDepartureTime,
        recommendedRestStops: routeData.restStops?.slice(0, 3),
        packingRecommendations: routeData.packingRecommendations,
        travelTips: routeData.travelTips,
        advisories: routeData.advisories
      };
    } catch (error) {
      console.error('getEnhancedTravelRecommendation error:', error.message);
      return { error: 'Failed to generate recommendation' };
    }
  }

  async findNearbyAmenities(params, headers) {
    const amenities = {
      restaurant: [
        { name: 'Highway Dhaba', distance: '0.5 km', type: 'North Indian', rating: '4.2 ⭐', timing: '24 hours' },
        { name: 'Food Plaza', distance: '1.2 km', type: 'Multi-cuisine', rating: '4.0 ⭐', timing: '6 AM - 11 PM' }
      ],
      hotel: [
        { name: 'Highway Inn', distance: '1.0 km', price: '₹2000/night', rating: '4.1 ⭐', amenities: 'Parking, WiFi, Restaurant' },
        { name: 'Rest Lodge', distance: '2.5 km', price: '₹1500/night', rating: '3.8 ⭐', amenities: 'Parking, AC, TV' }
      ],
      gas_station: [
        { name: 'Indian Oil', distance: '0.3 km', services: 'Fuel, Air, Water, Restroom', timing: '24 hours' },
        { name: 'Bharat Petroleum', distance: '1.8 km', services: 'Fuel, Air, Restroom, Mini mart', timing: '24 hours' }
      ]
    };
    
    const type = params.type || 'all';
    if (type === 'all') {
      return amenities;
    }
    return amenities[type] || [];
  }
}

export default new EnhancedAIToolService();