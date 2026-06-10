// backend/src/controllers/alertController.js
import catchAsync from '../utils/catchAsync.js';
import alertService from '../services/alertService.js';
import pushService from '../services/pushService.js';
import weatherService from '../services/weatherService.js';

export const getRouteAlerts = catchAsync(async (req, res, next) => {
  const { startLocation, endLocation, routeData, weatherData } = req.body;
  
  const alerts = await alertService.generateAlertsForRoute(
    routeData,
    weatherData,
    startLocation,
    endLocation
  );
  
  res.status(200).json({
    status: 'success',
    data: { alerts }
  });
});

export const savePushSubscription = catchAsync(async (req, res, next) => {
  const { subscription } = req.body;
  const userId = req.user.id;
  
  // Store subscription in database (you'll need to add this to User model)
  await req.user.updateOne({
    $set: { pushSubscription: subscription }
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Subscription saved'
  });
});

export const sendTestNotification = catchAsync(async (req, res, next) => {
  const { title, body } = req.body;
  const subscription = req.user.pushSubscription;
  
  if (!subscription) {
    return res.status(400).json({
      status: 'error',
      message: 'No push subscription found'
    });
  }
  
  await pushService.sendNotification(subscription, title, body);
  
  res.status(200).json({
    status: 'success',
    message: 'Test notification sent'
  });
});

export const getVapidKey = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: { publicKey: pushService.getVapidPublicKey() }
  });
});

export const updateAlertPreferences = catchAsync(async (req, res, next) => {
  const { notifications, alertTypes } = req.body;
  
  req.user.alertPreferences = {
    notifications: notifications !== undefined ? notifications : req.user.alertPreferences?.notifications ?? true,
    alertTypes: alertTypes || req.user.alertPreferences?.alertTypes || {
      rain: true,
      storms: true,
      fog: true,
      extremeTemp: true,
      wind: true
    }
  };
  
  await req.user.save();
  
  res.status(200).json({
    status: 'success',
    data: { preferences: req.user.alertPreferences }
  });
});