// backend/src/routes/calendar.js
import express from 'express';
import {
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  createRegularTripEvent,
  registerPushDevice
} from '../controllers/calendarController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/regular-trip', createRegularTripEvent);
router.post('/register-device', registerPushDevice);

export default router;