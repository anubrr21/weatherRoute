// backend/src/controllers/routeController.js
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import mapboxService from '../services/mapboxService.js';
import weatherService from '../services/weatherService.js';

/**
 * Plan a route between two or more locations with full weather data
 * POST /api/routes/plan
 */
export const planRoute = catchAsync(async (req, res, next) => {
  const { startLocation, endLocation, waypoints = [], profile = 'driving' } = req.body;
  
  if (!startLocation || !endLocation) {
    return next(new AppError('Please provide start and end locations', 400));
  }
  
  // Step 1: Geocode all locations
  const startCoords = await geocodeLocation(startLocation);
  const endCoords = await geocodeLocation(endLocation);
  
  if (!startCoords || !endCoords) {
    return next(new AppError('Could not find coordinates for one or more locations', 404));
  }
  
  // Geocode waypoints
  const waypointCoords = [];
  for (const waypoint of waypoints) {
    const coords = await geocodeLocation(waypoint);
    if (coords) {
      waypointCoords.push(coords);
    }
  }
  
  // Build coordinates array for routing
  const routeCoordinates = [
    [startCoords.lng, startCoords.lat],
    ...waypointCoords.map(w => [w.lng, w.lat]),
    [endCoords.lng, endCoords.lat]
  ];
  
  // Step 2: Get directions from Mapbox
  const directions = await mapboxService.getDirections(routeCoordinates, {
    alternatives: false,
    profile
  });
  
  if (!directions.routes || directions.routes.length === 0) {
    return next(new AppError('Could not find a route between these locations', 404));
  }
  
  const primaryRoute = directions.routes[0];
  
  // Step 3: Get weather along the route
  const weatherAlongRoute = await weatherService.getWeatherAlongRoute(
    primaryRoute.geometry,
    primaryRoute.distance.meters
  );
  
  // Step 4: Prepare response with full weather data
  const routeData = {
    route: {
      id: primaryRoute.id,
      distance: primaryRoute.distance,
      duration: primaryRoute.duration,
      geometry: primaryRoute.geometry,
      summary: primaryRoute.summary
    },
    locations: {
      start: {
        name: startLocation,
        coordinates: { lat: startCoords.lat, lng: startCoords.lng }
      },
      end: {
        name: endLocation,
        coordinates: { lat: endCoords.lat, lng: endCoords.lng }
      },
      waypoints: waypoints.map((wp, idx) => ({
        name: wp,
        coordinates: waypointCoords[idx] ? { lat: waypointCoords[idx].lat, lng: waypointCoords[idx].lng } : null
      }))
    },
    weatherAlongRoute: weatherAlongRoute
  };
  
  res.status(200).json({
    status: 'success',
    data: routeData
  });
});

/**
 * Geocode a location string to coordinates
 */
async function geocodeLocation(locationString) {
  // Check if already coordinates format
  if (locationString.includes(',')) {
    const parts = locationString.split(',');
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return {
        lat: parseFloat(parts[0]),
        lng: parseFloat(parts[1]),
        name: `${parseFloat(parts[0]).toFixed(4)}, ${parseFloat(parts[1]).toFixed(4)}`
      };
    }
  }
  
  // Geocode the address
  const result = await mapboxService.geocodeAddress(locationString);
  if (result && result.coordinates) {
    return {
      lat: result.coordinates[1],
      lng: result.coordinates[0],
      name: result.placeName
    };
  }
  return null;
}

/**
 * Get route alternatives with weather comparison
 * POST /api/routes/alternatives
 */
export const getRouteAlternatives = catchAsync(async (req, res, next) => {
  const { startLocation, endLocation, waypoints = [] } = req.body;
  
  if (!startLocation || !endLocation) {
    return next(new AppError('Please provide start and end locations', 400));
  }
  
  // Geocode locations
  const startCoords = await geocodeLocation(startLocation);
  const endCoords = await geocodeLocation(endLocation);
  
  if (!startCoords || !endCoords) {
    return next(new AppError('Could not find coordinates for locations', 404));
  }
  
  const routeCoordinates = [
    [startCoords.lng, startCoords.lat],
    [endCoords.lng, endCoords.lat]
  ];
  
  // Get directions with alternatives from Mapbox
  const directions = await mapboxService.getDirections(routeCoordinates, {
    alternatives: true
  });
  
  const routes = [];
  for (let i = 0; i < Math.min(directions.routes.length, 3); i++) {
    const route = directions.routes[i];
    
    // Get weather summary for this alternative
    const weatherAlongRoute = await weatherService.getWeatherAlongRoute(
      route.geometry,
      route.distance.meters
    );
    
    routes.push({
      id: route.id,
      name: i === 0 ? 'Recommended Route' : i === 1 ? 'Fastest Route' : 'Shortest Route',
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      summary: route.summary,
      weatherRisk: weatherAlongRoute.riskAnalysis.overall,
      weatherScore: weatherAlongRoute.riskAnalysis.score,
      weatherSummary: weatherAlongRoute.summary
    });
  }
  
  res.status(200).json({
    status: 'success',
    data: { routes }
  });
});