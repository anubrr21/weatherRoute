// backend/src/services/geocodeService.js
import axios from 'axios';

/**
 * Geocode Service - Handles reverse geocoding on backend to avoid CORS issues
 */
class GeocodeService {
  constructor() {
    this.baseURL = 'https://nominatim.openstreetmap.org';
    // Cache for location names (in-memory)
    this.cache = new Map();
    // Cache expiration: 1 hour
    this.cacheExpiry = 3600000;
  }

  /**
   * Reverse geocode coordinates to get location name
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<string|null>} Location name or null
   */
  async reverseGeocode(lat, lng) {
    // Round coordinates to 3 decimal places for consistent caching
    const roundedLat = Math.round(lat * 1000) / 1000;
    const roundedLng = Math.round(lng * 1000) / 1000;
    const cacheKey = `${roundedLat},${roundedLng}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.name;
      } else {
        this.cache.delete(cacheKey);
      }
    }
    
    try {
      const response = await axios.get(`${this.baseURL}/reverse`, {
        params: {
          format: 'json',
          lat: lat,
          lon: lng,
          zoom: 10,
          addressdetails: 1,
          'accept-language': 'en'
        },
        headers: {
          'User-Agent': 'WeatherRoute-App/1.0'
        },
        timeout: 5000
      });
      
      const data = response.data;
      const location = data.address?.city || 
                       data.address?.town || 
                       data.address?.village || 
                       data.address?.state_district ||
                       data.address?.county ||
                       null;
      
      if (location) {
        // Store in cache
        this.cache.set(cacheKey, {
          name: location,
          timestamp: Date.now()
        });
        return location;
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Batch reverse geocode multiple coordinates
   * @param {Array} coordinates - Array of {lat, lng} objects
   * @returns {Promise<Object>} Map of coordinate keys to location names
   */
  async batchReverseGeocode(coordinates) {
    const results = {};
    for (const coord of coordinates) {
      const key = `${coord.lat},${coord.lng}`;
      results[key] = await this.reverseGeocode(coord.lat, coord.lng);
    }
    return results;
  }

  /**
   * Clear expired cache entries
   */
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp >= this.cacheExpiry) {
        this.cache.delete(key);
      }
    }
  }
}

export default new GeocodeService();