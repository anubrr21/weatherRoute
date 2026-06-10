// backend/src/routes/weather.js
import express from 'express';
import {
  getCurrentWeather,
  getForecast,
  getAllWeatherData,
  searchCities
} from '../controllers/weatherController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes (weather data)
router.get('/current', getCurrentWeather);
router.get('/forecast', getForecast);
router.get('/all', getAllWeatherData);
router.get('/search', searchCities);

// Protected routes (for saving search history)
router.use(protect);
// Any weather routes that need to save history can go here

export default router;