// backend/src/controllers/userController.js
import catchAsync from '../utils/catchAsync.js';
import Favorite from '../models/Favorite.js';
import SearchHistory from '../models/SearchHistory.js';
import AppError from '../utils/AppError.js';

/**
 * Add location to favorites
 */
export const addFavorite = catchAsync(async (req, res, next) => {
  const { locationName, lat, lng, country, customName, notes } = req.body;
  
  // Check if already favorited
  const existing = await Favorite.findOne({
    userId: req.user.id,
    lat,
    lng
  });
  
  if (existing) {
    return next(new AppError('Location already in favorites', 400));
  }
  
  const favorite = await Favorite.create({
    userId: req.user.id,
    locationName,
    lat,
    lng,
    country,
    customName,
    notes
  });
  
  res.status(201).json({
    status: 'success',
    data: { favorite }
  });
});

/**
 * Get user's favorites
 */
export const getFavorites = catchAsync(async (req, res, next) => {
  const favorites = await Favorite.find({ userId: req.user.id })
    .sort({ createdAt: -1 });
  
  res.status(200).json({
    status: 'success',
    data: { favorites }
  });
});

/**
 * Remove favorite
 */
export const removeFavorite = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  
  const favorite = await Favorite.findOneAndDelete({
    _id: id,
    userId: req.user.id
  });
  
  if (!favorite) {
    return next(new AppError('Favorite not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Favorite removed successfully'
  });
});

/**
 * Get search history
 */
export const getSearchHistory = catchAsync(async (req, res, next) => {
  const history = await SearchHistory.find({ userId: req.user.id })
    .sort({ lastSearched: -1 })
    .limit(20);
  
  res.status(200).json({
    status: 'success',
    data: { history }
  });
});

/**
 * Clear search history
 */
export const clearSearchHistory = catchAsync(async (req, res, next) => {
  await SearchHistory.deleteMany({ userId: req.user.id });
  
  res.status(200).json({
    status: 'success',
    message: 'Search history cleared'
  });
});

/**
 * Update user preferences
 */
export const updatePreferences = catchAsync(async (req, res, next) => {
  const { temperatureUnit, theme, notifications } = req.body;
  
  req.user.preferences = {
    ...req.user.preferences,
    temperatureUnit,
    theme,
    notifications
  };
  
  await req.user.save();
  
  res.status(200).json({
    status: 'success',
    data: { preferences: req.user.preferences }
  });
});