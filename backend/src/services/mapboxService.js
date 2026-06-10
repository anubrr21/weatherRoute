// backend/src/services/mapboxService.js
import dotenv from 'dotenv';
dotenv.config();
import axios from 'axios';

/**
 * Mapbox Service - Handles all Mapbox API integrations
 * This service provides:
 * - Route directions between coordinates
 * - Geocoding (address to coordinates)
 * - Route polylines for map display
 */
class MapboxService {
  constructor() {
    this.accessToken = process.env.MAPBOX_ACCESS_TOKEN;
    this.baseURL = 'https://api.mapbox.com';
    console.log("MAPBOX TOKEN:", process.env.MAPBOX_ACCESS_TOKEN);
    
    if (!this.accessToken) {
      console.warn('⚠️ MAPBOX_ACCESS_TOKEN not found in environment variables');
    }
  }

  /**
   * Get driving directions between two or more points
   * @param {Array} coordinates - Array of [lng, lat] pairs
   * @param {Object} options - Route options (alternatives, profile, etc)
   * @returns {Object} Route data including distance, duration, geometry
   */
  async getDirections(coordinates, options = {}) {
    try {
      // Format coordinates for Mapbox API: "lng,lat;lng,lat;..."
      const coordinatesStr = coordinates
        .map(coord => `${coord[0]},${coord[1]}`)
        .join(';');
      
      // Build query parameters
      const params = {
        access_token: this.accessToken,
        alternatives: options.alternatives || false,
        geometries: 'geojson',
        overview: 'full',
        steps: options.steps || false,
        continue_straight: options.continueStraight || false
      };
      
      // Add profile (driving, walking, cycling)
      const profile = options.profile || 'driving';
      
      // Make API call to Mapbox Directions API
      const response = await axios.get(
        `${this.baseURL}/directions/v5/mapbox/${profile}/${coordinatesStr}`,
        { params }
      );
      
      if (!response.data || !response.data.routes || response.data.routes.length === 0) {
        throw new Error('No routes found');
      }
      
      // Format and return route data
      return this.formatRouteResponse(response.data, coordinates);
      
    } catch (error) {
      console.error('Mapbox Directions Error:', error.response?.data || error.message);
      throw new Error(`Failed to get directions: ${error.message}`);
    }
  }

  /**
   * Format Mapbox response into our application's route structure
   */
  formatRouteResponse(data, originalCoordinates) {
    const routes = data.routes.map((route, index) => ({
      id: index,
      distance: {
        meters: route.distance,
        kilometers: (route.distance / 1000).toFixed(1),
        miles: (route.distance / 1609.34).toFixed(1),
        text: this.formatDistance(route.distance)
      },
      duration: {
        seconds: route.duration,
        minutes: Math.round(route.duration / 60),
        hours: (route.duration / 3600).toFixed(1),
        text: this.formatDuration(route.duration)
      },
      geometry: route.geometry, // GeoJSON line string for map
      summary: route.summary,
      waypoints: data.waypoints,
      weight: route.weight,
      weightName: route.weight_name
    }));
    
    return {
      code: data.code,
      routes,
      waypoints: data.waypoints,
      originalCoordinates
    };
  }

  /**
   * Format distance for display (e.g., "245 km" or "152 miles")
   */
  formatDistance(meters) {
    const km = meters / 1000;
    if (km < 1) {
      return `${Math.round(meters)} m`;
    } else if (km < 100) {
      return `${km.toFixed(1)} km`;
    } else {
      return `${Math.round(km)} km`;
    }
  }

  /**
   * Format duration for display (e.g., "2h 30min")
   */
  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes} min`;
    } else if (minutes === 0) {
      return `${hours} h`;
    } else {
      return `${hours}h ${minutes}min`;
    }
  }

  /**
   * Geocode an address or place name to coordinates
   * @param {string} query - Place name or address
   * @returns {Array} [longitude, latitude] or null
   */
  async geocodeAddress(query) {
    try {
      const response = await axios.get(
        `${this.baseURL}/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
        {
          params: {
            access_token: this.accessToken,
            limit: 1
          }
        }
      );
      
      if (response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        return {
          coordinates: feature.geometry.coordinates, // [lng, lat]
          placeName: feature.place_name,
          center: feature.center
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error.message);
      return null;
    }
  }

  /**
   * Reverse geocode - get place name from coordinates
   */
  async reverseGeocode(lng, lat) {
    try {
      const response = await axios.get(
        `${this.baseURL}/geocoding/v5/mapbox.places/${lng},${lat}.json`,
        {
          params: {
            access_token: this.accessToken,
            limit: 1
          }
        }
      );
      
      if (response.data.features && response.data.features.length > 0) {
        return response.data.features[0].place_name;
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error.message);
      return null;
    }
  }
}
const mapboxService = new MapboxService();
export default mapboxService;