// backend/src/routes/geocode.js
import express from 'express';
import { reverseGeocode, batchReverseGeocode } from '../controllers/geocodeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All geocode routes require authentication
router.use(protect);

router.get('/reverse', reverseGeocode);
router.post('/batch', batchReverseGeocode);

export default router;