// backend/src/routes/preferences.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';

const router = express.Router();

// Get user travel preferences
router.get('/travel', protect, catchAsync(async (req, res, next) => {
  console.log('📌 GET /preferences/travel - User:', req.user.id);
  res.status(200).json({
    status: 'success',
    data: {
      preferences: req.user.travelPreferences || {}
    }
  });
}));

// Update user travel preferences
router.put('/travel', protect, catchAsync(async (req, res, next) => {
  console.log('📌 PUT /preferences/travel - User:', req.user.id);
  console.log('📌 Update data:', req.body);
  
  const allowedFields = [
    'preferredTransport', 'avoidTransport', 'maxDrivingHoursPerDay',
    'avoidNightDriving', 'preferredRestStopInterval', 'dietaryPreference',
    'routePreference', 'budgetCategory', 'favoriteDestinations', 'regularTrips'
  ];
  
  const updates = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }
  
  // Merge with existing preferences
  req.user.travelPreferences = {
    ...req.user.travelPreferences,
    ...updates,
    preferencesLastUpdated: new Date()
  };
  
  await req.user.save();
  
  console.log('📌 Preferences saved:', req.user.travelPreferences);
  
  res.status(200).json({
    status: 'success',
    data: {
      preferences: req.user.travelPreferences
    }
  });
}));

// Add a regular trip
router.post('/travel/regular-trip', protect, catchAsync(async (req, res, next) => {
  console.log('📌 POST /preferences/regular-trip - User:', req.user.id);
  console.log('📌 Trip data:', req.body);
  
  const { name, startLocation, endLocation, preferredDays } = req.body;
  
  if (!name || !startLocation || !endLocation) {
    return next(new AppError('Missing required fields', 400));
  }
  
  const regularTrips = req.user.travelPreferences?.regularTrips || [];
  regularTrips.push({ name, startLocation, endLocation, preferredDays: preferredDays || 'weekend' });
  
  req.user.travelPreferences = {
    ...req.user.travelPreferences,
    regularTrips,
    preferencesLastUpdated: new Date()
  };
  
  await req.user.save();
  
  console.log('📌 Regular trip added, total trips:', regularTrips.length);
  
  res.status(201).json({
    status: 'success',
    data: { regularTrips }
  });
}));

// Add favorite destination
router.post('/travel/favorite', protect, catchAsync(async (req, res, next) => {
  console.log('📌 POST /preferences/favorite - User:', req.user.id);
  console.log('📌 Favorite destination:', req.body.destination);
  
  const { destination } = req.body;
  
  if (!destination) {
    return next(new AppError('Destination is required', 400));
  }
  
  const favorites = req.user.travelPreferences?.favoriteDestinations || [];
  if (!favorites.includes(destination)) {
    favorites.push(destination);
  }
  
  req.user.travelPreferences = {
    ...req.user.travelPreferences,
    favoriteDestinations: favorites,
    preferencesLastUpdated: new Date()
  };
  
  await req.user.save();
  
  res.status(200).json({
    status: 'success',
    data: { favoriteDestinations: favorites }
  });
}));

export default router;