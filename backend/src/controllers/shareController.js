// backend/src/controllers/shareController.js
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import shareService from '../services/shareService.js';

export const createShare = catchAsync(async (req, res, next) => {
  const { routeData, locations, weatherData, options = {} } = req.body;
  
  if (!routeData || !locations || !weatherData) {
    return next(new AppError('Missing required route data', 400));
  }
  
  const result = await shareService.createShareToken(
    routeData,
    locations,
    weatherData,
    req.user.id,
    req.user.username,
    options
  );
  
  res.status(201).json({
    status: 'success',
    data: result
  });
});

export const getSharedRoute = catchAsync(async (req, res, next) => {
  const { shareToken } = req.params;
  
  const result = await shareService.getSharedRoute(shareToken);
  
  if (result.error) {
    return next(new AppError(result.error, 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: result
  });
});

export const getUserShares = catchAsync(async (req, res, next) => {
  const shares = await shareService.getUserSharedRoutes(req.user.id);
  
  res.status(200).json({
    status: 'success',
    data: { shares }
  });
});

export const deleteShare = catchAsync(async (req, res, next) => {
  const { shareToken } = req.params;
  
  const deleted = await shareService.deleteSharedRoute(shareToken, req.user.id);
  
  if (!deleted) {
    return next(new AppError('Share link not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Share link deleted'
  });
});

export const generateShareMessage = catchAsync(async (req, res, next) => {
  const { routeData, startLocation, endLocation } = req.body;
  
  const message = shareService.generateShareableMessage(routeData, startLocation, endLocation);
  
  res.status(200).json({
    status: 'success',
    data: { message }
  });
});