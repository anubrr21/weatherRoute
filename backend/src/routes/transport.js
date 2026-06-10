// backend/src/routes/transport.js
import express from 'express';
import { getAllTransportOptions } from '../controllers/transportController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/all', getAllTransportOptions);

export default router;