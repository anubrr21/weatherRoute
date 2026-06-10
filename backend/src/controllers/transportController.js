// backend/src/controllers/transportController.js
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import trainService from '../services/trainService.js';
import flightService from '../services/flightService.js';
import weatherService from '../services/weatherService.js';
import mapboxService from '../services/mapboxService.js';

/**
 * Get multi-modal transport options (Road, Train, Flight)
 * POST /api/transport/all
 */
export const getAllTransportOptions = catchAsync(async (req, res, next) => {
  const { startLocation, endLocation, travelDate } = req.body;
  
  if (!startLocation || !endLocation) {
    return next(new AppError('Please provide start and end locations', 400));
  }
  
  // Get coordinates for weather
  const startCoords = await geocodeLocation(startLocation);
  const endCoords = await geocodeLocation(endLocation);
  
  let weatherAtDestination = null;
  if (endCoords) {
    weatherAtDestination = await weatherService.getCurrentWeather(endCoords.lat, endCoords.lng);
  }
  
  // Get all transport options in parallel
  const [trainOptions, flightOptions] = await Promise.all([
    trainService.getTrainRoutes(startLocation, endLocation, travelDate),
    flightService.getFlightRoutes(startLocation, endLocation, travelDate)
  ]);
  
  // Calculate weather impact for each transport mode
  const weatherImpact = analyzeWeatherImpact(weatherAtDestination);
  
  // Generate AI comparison recommendation
  const recommendation = generateRecommendation(trainOptions, flightOptions, weatherImpact);
  
  res.status(200).json({
    status: 'success',
    data: {
      startLocation,
      endLocation,
      travelDate: travelDate || new Date().toISOString().split('T')[0],
      weatherAtDestination,
      weatherImpact,
      train: trainOptions,
      flight: flightOptions,
      recommendation
    }
  });
});

/**
 * Get weather impact analysis for transport modes
 */
function analyzeWeatherImpact(weather) {
  if (!weather) return { overall: 'unknown', impacts: {} };
  
  const impacts = {
    road: { risk: 'low', message: 'Normal driving conditions' },
    train: { risk: 'low', message: 'Trains operating normally' },
    flight: { risk: 'low', message: 'Flights operating normally' }
  };
  
  if (weather.condition === 'Rain') {
    impacts.road = { risk: 'moderate', message: 'Wet roads, drive carefully' };
    impacts.train = { risk: 'low', message: 'Trains may have slight delays' };
    impacts.flight = { risk: 'moderate', message: 'Possible departure delays' };
  } else if (weather.condition === 'Thunderstorm') {
    impacts.road = { risk: 'high', message: 'Avoid driving if possible' };
    impacts.train = { risk: 'moderate', message: 'Expect delays' };
    impacts.flight = { risk: 'high', message: 'Likely cancellations' };
  } else if (weather.condition === 'Fog' || weather.condition === 'Mist') {
    impacts.road = { risk: 'high', message: 'Low visibility, drive slow' };
    impacts.train = { risk: 'low', message: 'Minor delays possible' };
    impacts.flight = { risk: 'high', message: 'Possible delays/cancellations' };
  } else if (weather.temp > 35) {
    impacts.road = { risk: 'moderate', message: 'Heat warning, carry water' };
    impacts.train = { risk: 'low', message: 'Comfortable AC coaches' };
    impacts.flight = { risk: 'low', message: 'Normal operations' };
  }
  
  return {
    overall: weather.condition,
    temperature: weather.temp,
    condition: weather.condition,
    impacts
  };
}

/**
 * Generate AI recommendation comparing transport modes
 */
function generateRecommendation(trainOptions, flightOptions, weatherImpact) {
  const hasTrains = trainOptions.trains && trainOptions.trains.length > 0;
  const hasFlights = flightOptions.flights && flightOptions.flights.length > 0;
  
  // Default recommendation
  let recommendation = {
    bestMode: 'road',
    reason: 'Road route provides detailed weather insights and flexibility',
    alternatives: []
  };
  
  // Compare based on weather impact
  const weatherScores = {
    road: weatherImpact.impacts?.road?.risk === 'low' ? 10 : 
          weatherImpact.impacts?.road?.risk === 'moderate' ? 5 : 2,
    train: weatherImpact.impacts?.train?.risk === 'low' ? 10 :
           weatherImpact.impacts?.train?.risk === 'moderate' ? 5 : 2,
    flight: weatherImpact.impacts?.flight?.risk === 'low' ? 10 :
            weatherImpact.impacts?.flight?.risk === 'moderate' ? 5 : 2
  };
  
  // Find best mode
  let bestScore = 10;
  let bestMode = 'road';
  
  if (hasTrains && weatherScores.train > bestScore) {
    bestScore = weatherScores.train;
    bestMode = 'train';
  }
  if (hasFlights && weatherScores.flight > bestScore) {
    bestScore = weatherScores.flight;
    bestMode = 'flight';
  }
  
  const recommendations = {
    road: 'Road travel gives you complete control and detailed weather insights along your route.',
    train: 'Train travel is comfortable and less affected by weather conditions.',
    flight: 'Flight is the fastest option, especially for long distances.'
  };
  
  recommendation.bestMode = bestMode;
  recommendation.reason = recommendations[bestMode];
  recommendation.weatherScore = weatherScores;
  
  if (hasTrains && trainOptions.trains[0]) {
    recommendation.alternatives.push({
      mode: 'train',
      name: trainOptions.trains[0].trainName,
      duration: trainOptions.trains[0].duration,
      recommendation: weatherScores.train >= 8 ? 'Good weather for train travel' : 'Weather may cause minor delays'
    });
  }
  
  if (hasFlights && flightOptions.flights[0]) {
    recommendation.alternatives.push({
      mode: 'flight',
      name: flightOptions.flights[0].airline,
      duration: flightOptions.flights[0].duration,
      recommendation: weatherScores.flight >= 8 ? 'Weather conditions favorable for flying' : 'Possible weather-related delays'
    });
  }
  
  return recommendation;
}

/**
 * Geocode helper function
 */
async function geocodeLocation(locationString) {
  if (locationString.includes(',')) {
    const parts = locationString.split(',');
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return {
        lat: parseFloat(parts[0]),
        lng: parseFloat(parts[1])
      };
    }
  }
  
  const result = await mapboxService.geocodeAddress(locationString);
  if (result && result.coordinates) {
    return {
      lat: result.coordinates[1],
      lng: result.coordinates[0]
    };
  }
  return null;
}