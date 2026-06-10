// backend/src/services/shareService.js
import { nanoid } from 'nanoid';
import SharedRoute from '../models/SharedRoute.js';

class ShareService {
  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  }

  async createShareToken(routeData, locations, weatherData, userId, username, options = {}) {
    const shareToken = nanoid(12); // Generate unique token
    
    const sharedRoute = new SharedRoute({
      shareToken,
      userId,
      username,
      startLocation: {
        name: locations.start.name,
        lat: locations.start.coordinates.lat,
        lng: locations.start.coordinates.lng
      },
      endLocation: {
        name: locations.end.name,
        lat: locations.end.coordinates.lat,
        lng: locations.end.coordinates.lng
      },
      waypoints: locations.waypoints.filter(w => w.coordinates).map(w => ({
        name: w.name,
        lat: w.coordinates.lat,
        lng: w.coordinates.lng
      })),
      routeData: {
        distance: routeData.distance,
        duration: routeData.duration,
        geometry: routeData.geometry,
        summary: routeData.summary
      },
      weatherData: weatherData,
      shareSettings: {
        expiresAt: options.expiresAt || null,
        maxViews: options.maxViews || null,
        allowTracking: options.allowTracking || false
      }
    });
    
    await sharedRoute.save();
    
    return {
      shareToken,
      shareUrl: `${this.baseUrl}/share/${shareToken}`,
      expiresAt: sharedRoute.expiresAt,
      createdAt: sharedRoute.createdAt
    };
  }

  async getSharedRoute(shareToken) {
    const sharedRoute = await SharedRoute.findOne({ shareToken });
    
    if (!sharedRoute) {
      return { error: 'Share link not found or expired' };
    }
    
    // Check expiration
    if (sharedRoute.expiresAt && new Date() > sharedRoute.expiresAt) {
      return { error: 'This share link has expired' };
    }
    
    // Check max views
    if (sharedRoute.shareSettings.maxViews && sharedRoute.views >= sharedRoute.shareSettings.maxViews) {
      return { error: 'This share link has reached its maximum views' };
    }
    
    // Increment view count
    sharedRoute.views += 1;
    await sharedRoute.save();
    
    return {
      success: true,
      sharedBy: sharedRoute.username,
      startLocation: sharedRoute.startLocation,
      endLocation: sharedRoute.endLocation,
      waypoints: sharedRoute.waypoints,
      routeData: sharedRoute.routeData,
      weatherData: sharedRoute.weatherData,
      createdAt: sharedRoute.createdAt,
      allowTracking: sharedRoute.shareSettings.allowTracking
    };
  }

  async getUserSharedRoutes(userId) {
    return await SharedRoute.find({ userId })
      .sort({ createdAt: -1 })
      .select('shareToken startLocation endLocation views createdAt expiresAt');
  }

  async deleteSharedRoute(shareToken, userId) {
    const result = await SharedRoute.findOneAndDelete({ shareToken, userId });
    return !!result;
  }

  generateShareableMessage(routeData, startLocation, endLocation) {
    const distance = routeData.distance?.text || `${Math.round(routeData.distance?.meters / 1000)} km`;
    const duration = routeData.duration?.text || `${Math.round(routeData.duration?.minutes)} min`;
    
    return `🌤️ Check out my travel plan on WeatherRoute!\n\n📍 From: ${startLocation}\n📍 To: ${endLocation}\n📏 Distance: ${distance}\n⏱️ Duration: ${duration}\n\nPlan your trip with real-time weather at WeatherRoute!`;
  }
}

export default new ShareService();