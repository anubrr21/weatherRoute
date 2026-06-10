// backend/src/routes/alerts.js
import express from 'express';
import {
  getRouteAlerts,
  savePushSubscription,
  sendTestNotification,
  getVapidKey,
  updateAlertPreferences
} from '../controllers/alertController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/route', getRouteAlerts);
router.post('/subscribe', savePushSubscription);
router.post('/test', sendTestNotification);
router.get('/vapid-key', getVapidKey);
router.put('/preferences', updateAlertPreferences);

export default router;