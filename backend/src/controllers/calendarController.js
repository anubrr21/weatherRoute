// backend/src/controllers/calendarController.js
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/AppError.js';
import calendarService from '../services/calendarService.js';
import onesignalService from '../services/onesignalService.js';

export const createEvent = catchAsync(async (req, res, next) => {
  const event = await calendarService.createEvent(req.user.id, req.body);
  
  res.status(201).json({
    status: 'success',
    data: { event }
  });
});

export const getEvents = catchAsync(async (req, res, next) => {
  const { start, end } = req.query;
  const events = await calendarService.getEvents(req.user.id, start, end);
  
  res.status(200).json({
    status: 'success',
    data: { events }
  });
});

export const updateEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const event = await calendarService.updateEvent(id, req.user.id, req.body);
  
  if (!event) {
    return next(new AppError('Event not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: { event }
  });
});

export const deleteEvent = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const event = await calendarService.deleteEvent(id, req.user.id);
  
  if (!event) {
    return next(new AppError('Event not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    message: 'Event deleted'
  });
});

export const createRegularTripEvent = catchAsync(async (req, res, next) => {
  const { tripName } = req.body;
  const userPreferences = req.user.travelPreferences || {};
  
  const event = await calendarService.createRegularTripFromPreferences(
    req.user.id,
    tripName,
    userPreferences
  );
  
  if (!event) {
    return next(new AppError('Regular trip not found in preferences', 404));
  }
  
  res.status(201).json({
    status: 'success',
    data: { event }
  });
});

export const registerPushDevice = catchAsync(async (req, res, next) => {
  const { playerId } = req.body;
  
  if (!playerId) {
    return next(new AppError('Player ID is required', 400));
  }
  
  onesignalService.registerPlayerId(req.user.id, playerId);
  
  res.status(200).json({
    status: 'success',
    message: 'Device registered for notifications'
  });
});