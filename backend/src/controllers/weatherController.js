// backend/src/controllers/weatherController.js
import catchAsync from '../utils/catchAsync.js';
import weatherService from '../services/weatherService.js';
import SearchHistory from '../models/SearchHistory.js';
import AppError from '../utils/AppError.js';

/**
 * Get current weather for a location
 */
export const getCurrentWeather = catchAsync(async (req, res, next) => {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return next(new AppError('Please provide latitude and longitude', 400));
  }
  
  const weather = await weatherService.getCurrentWeather(parseFloat(lat), parseFloat(lon));
  
  // Save to search history if user is logged in
  if (req.user && req.query.locationName) {
    await SearchHistory.findOneAndUpdate(
      {
        userId: req.user.id,
        lat: parseFloat(lat),
        lon: parseFloat(lon)
      },
      {
        $inc: { searchCount: 1 },
        $set: {
          locationName: req.query.locationName,
          lastSearched: new Date()
        }
      },
      { upsert: true, new: true }
    );
  }
  
  res.status(200).json({
    status: 'success',
    data: { weather }
  });
});

/**
 * Get 5-day forecast
 */
export const getForecast = catchAsync(async (req, res, next) => {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return next(new AppError('Please provide latitude and longitude', 400));
  }
  
  const forecast = await weatherService.getForecast(parseFloat(lat), parseFloat(lon));
  
  res.status(200).json({
    status: 'success',
    data: { forecast }
  });
});

/**
 * Get all weather data (current + forecast + AQI) in one request
 */
export const getAllWeatherData = catchAsync(async (req, res, next) => {
  const { lat, lon } = req.query;
  
  if (!lat || !lon) {
    return next(new AppError('Please provide latitude and longitude', 400));
  }
  
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  
  // Fetch all data in parallel for better performance
  const [current, forecast, airQuality] = await Promise.all([
    weatherService.getCurrentWeather(latNum, lonNum),
    weatherService.getForecast(latNum, lonNum),
    weatherService.getAirQuality(latNum, lonNum)
  ]);
  
  res.status(200).json({
    status: 'success',
    data: {
      current,
      forecast,
      airQuality
    }
  });
});

/**
 * Search cities
 */
export const searchCities = catchAsync(async (req, res, next) => {
  const { query } = req.query;
  
  if (!query || query.length < 2) {
    return next(new AppError('Please provide a search query (minimum 2 characters)', 400));
  }
  
  const cities = await weatherService.searchCities(query);
  
  res.status(200).json({
    status: 'success',
    data: { cities }
  });
});