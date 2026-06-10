// backend/src/routes/share.js
import express from 'express';
import {
  createShare,
  getSharedRoute,
  getUserShares,
  deleteShare,
  generateShareMessage
} from '../controllers/shareController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public route (no auth required for viewing)
router.get('/:shareToken', getSharedRoute);

// Protected routes
router.use(protect);
router.post('/create', createShare);
router.get('/user/shares', getUserShares);
router.delete('/:shareToken', deleteShare);
router.post('/generate-message', generateShareMessage);

export default router;