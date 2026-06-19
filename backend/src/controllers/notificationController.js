// backend/src/controllers/notificationController.js
import catchAsync from '../utils/catchAsync.js';
import oneSignalService from '../services/oneSignalService.js';

export const subscribe = catchAsync(async (req, res, next) => {
  const { playerId } = req.body;
  
  if (!playerId) {
    return res.status(400).json({
      status: 'error',
      message: 'Player ID is required'
    });
  }

  await oneSignalService.registerPlayerId(req.user.id, playerId);
  
  // Store in user model
  req.user.oneSignalPlayerId = playerId;
  await req.user.save();

  res.status(200).json({
    status: 'success',
    message: 'Subscribed to push notifications'
  });
});

export const unsubscribe = catchAsync(async (req, res, next) => {
  req.user.oneSignalPlayerId = null;
  await req.user.save();

  res.status(200).json({
    status: 'success',
    message: 'Unsubscribed from push notifications'
  });
});

export const sendTestNotification = catchAsync(async (req, res, next) => {
  const { title, body } = req.body;
  
  if (!req.user.oneSignalPlayerId) {
    return res.status(400).json({
      status: 'error',
      message: 'User not subscribed to push notifications'
    });
  }

  await oneSignalService.sendNotificationToUser(
    req.user.id,
    title || '🔔 Test Notification',
    body || 'This is a test notification from WeatherRoute!',
    { url: '/dashboard' }
  );

  res.status(200).json({
    status: 'success',
    message: 'Test notification sent'
  });
});