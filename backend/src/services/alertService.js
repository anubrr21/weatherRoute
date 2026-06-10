// backend/src/services/alertService.js
import weatherService from './weatherService.js';

class AlertService {
  constructor() {
    this.alertThresholds = {
      rain: { condition: 'Rain', severity: 'moderate' },
      heavyRain: { condition: 'Thunderstorm', severity: 'high' },
      fog: { condition: 'Fog', severity: 'moderate' },
      mist: { condition: 'Mist', severity: 'low' },
      extremeHeat: { temp: 40, severity: 'high' },
      extremeCold: { temp: 5, severity: 'high' },
      highWind: { windSpeed: 15, severity: 'moderate' }
    };
  }

  async generateAlertsForRoute(routeData, weatherData, startLocation, endLocation) {
    const alerts = [];
    
    if (!weatherData || !weatherData.points) {
      return alerts;
    }
    
    // Check each weather point for alerts
    for (const point of weatherData.points) {
      const weather = point.weather;
      if (!weather) continue;
      
      const pointAlerts = this.checkWeatherConditions(weather, point.distanceFromStartKm);
      alerts.push(...pointAlerts);
    }
    
    // Check destination weather
    if (weatherData.destinationWeather) {
      const destAlerts = this.checkDestinationWeather(weatherData.destinationWeather);
      alerts.push(...destAlerts);
    }
    
    // Remove duplicates and sort by severity
    const uniqueAlerts = this.removeDuplicateAlerts(alerts);
    return this.sortBySeverity(uniqueAlerts);
  }

  checkWeatherConditions(weather, distanceKm) {
    const alerts = [];
    
    // Rain alerts
    if (weather.condition === 'Rain') {
      alerts.push({
        id: `rain_${distanceKm}`,
        type: 'rain',
        severity: 'moderate',
        title: '🌧️ Rain Ahead',
        message: `Rain expected at ${Math.round(distanceKm)}km mark. Drive carefully, wet roads ahead.`,
        distance: distanceKm,
        action: 'slow_down',
        recommendation: 'Reduce speed by 10-15 km/h'
      });
    }
    
    // Thunderstorm alert
    if (weather.condition === 'Thunderstorm') {
      alerts.push({
        id: `storm_${distanceKm}`,
        type: 'thunderstorm',
        severity: 'high',
        title: '⛈️ Thunderstorm Warning',
        message: `Thunderstorm detected at ${Math.round(distanceKm)}km. Consider waiting it out.`,
        distance: distanceKm,
        action: 'wait',
        recommendation: 'Delay travel if possible'
      });
    }
    
    // Fog alert
    if (weather.condition === 'Fog' || weather.condition === 'Mist') {
      alerts.push({
        id: `fog_${distanceKm}`,
        type: 'fog',
        severity: weather.condition === 'Fog' ? 'high' : 'moderate',
        title: '🌫️ Low Visibility',
        message: `${weather.condition} expected at ${Math.round(distanceKm)}km. Visibility may be reduced.`,
        distance: distanceKm,
        action: 'slow_down',
        recommendation: 'Use fog lights, maintain extra distance'
      });
    }
    
    // Extreme heat alert
    if (weather.temp > 38) {
      alerts.push({
        id: `heat_${distanceKm}`,
        type: 'heat',
        severity: 'moderate',
        title: '🥵 Extreme Heat Warning',
        message: `Temperature reaching ${weather.temp}°C at ${Math.round(distanceKm)}km. Stay hydrated.`,
        distance: distanceKm,
        action: 'hydrate',
        recommendation: 'Carry extra water, take AC breaks'
      });
    }
    
    // Extreme cold alert
    if (weather.temp < 5) {
      alerts.push({
        id: `cold_${distanceKm}`,
        type: 'cold',
        severity: 'high',
        title: '❄️ Freezing Conditions',
        message: `Temperature dropping to ${weather.temp}°C at ${Math.round(distanceKm)}km. Possible black ice.`,
        distance: distanceKm,
        action: 'caution',
        recommendation: 'Drive slowly, watch for ice'
      });
    }
    
    // High wind alert
    if (weather.windSpeed > 12) {
      alerts.push({
        id: `wind_${distanceKm}`,
        type: 'wind',
        severity: weather.windSpeed > 15 ? 'high' : 'moderate',
        title: '💨 Strong Winds',
        message: `Wind speed ${weather.windSpeed} m/s at ${Math.round(distanceKm)}km.`,
        distance: distanceKm,
        action: 'caution',
        recommendation: 'Hold steering firmly, especially on bridges'
      });
    }
    
    return alerts;
  }

  checkDestinationWeather(weather) {
    const alerts = [];
    
    if (weather.condition === 'Rain') {
      alerts.push({
        id: 'dest_rain',
        type: 'rain',
        severity: 'moderate',
        title: '🌧️ Rain at Destination',
        message: `Rain expected at your destination (${weather.city}). Pack an umbrella.`,
        distance: null,
        action: 'prepare',
        recommendation: 'Carry rain gear'
      });
    }
    
    if (weather.temp > 38) {
      alerts.push({
        id: 'dest_heat',
        type: 'heat',
        severity: 'moderate',
        title: '🥵 Hot Weather at Destination',
        message: `${weather.temp}°C expected at ${weather.city}. Stay hydrated.`,
        distance: null,
        action: 'prepare',
        recommendation: 'Light clothing, carry water'
      });
    }
    
    return alerts;
  }

  removeDuplicateAlerts(alerts) {
    const seen = new Set();
    return alerts.filter(alert => {
      if (seen.has(alert.type)) return false;
      seen.add(alert.type);
      return true;
    });
  }

  sortBySeverity(alerts) {
    const severityOrder = { high: 0, moderate: 1, low: 2 };
    return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  }

  shouldSendPushNotification(alert, userPreferences) {
    if (!userPreferences?.notifications) return false;
    
    const typePref = userPreferences.alertTypes;
    if (!typePref) return true;
    
    switch (alert.type) {
      case 'rain': return typePref.rain !== false;
      case 'thunderstorm': return typePref.storms !== false;
      case 'fog': return typePref.fog !== false;
      case 'heat': return typePref.extremeTemp !== false;
      case 'cold': return typePref.extremeTemp !== false;
      case 'wind': return typePref.wind !== false;
      default: return true;
    }
  }
}

export default new AlertService();