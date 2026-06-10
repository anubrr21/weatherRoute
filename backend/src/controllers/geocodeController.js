// backend/src/controllers/geocodeController.js
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import geocodeService from '../services/geocodeService.js';

/**
 * Reverse geocode a single coordinate
 * GET /api/geocode/reverse?lat=...&lng=...
 */
export const reverseGeocode = catchAsync(async (req, res, next) => {
  const { lat, lng } = req.query;
  
  if (!lat || !lng) {
    return next(new AppError('Please provide lat and lng parameters', 400));
  }
  
  const parsedLat = parseFloat(lat);
  const parsedLng = parseFloat(lng);
  
  if (isNaN(parsedLat) || isNaN(parsedLng)) {
    return next(new AppError('Invalid latitude or longitude values', 400));
  }
  
  const locationName = await geocodeService.reverseGeocode(parsedLat, parsedLng);
  
  res.status(200).json({
    status: 'success',
    data: {
      lat: parsedLat,
      lng: parsedLng,
      locationName
    }
  });
});

/**
 * Batch reverse geocode multiple coordinates
 * POST /api/geocode/batch
 * Body: { coordinates: [{ lat, lng }] }
 */
export const batchReverseGeocode = catchAsync(async (req, res, next) => {
  const { coordinates } = req.body;
  
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return next(new AppError('Please provide an array of coordinates', 400));
  }
  
  const results = await geocodeService.batchReverseGeocode(coordinates);
  
  res.status(200).json({
    status: 'success',
    data: { results }
  });
});