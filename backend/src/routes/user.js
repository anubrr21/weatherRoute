// backend/src/routes/user.js
import express from 'express';
import {
  addFavorite,
  getFavorites,
  removeFavorite,
  getSearchHistory,
  clearSearchHistory,
  updatePreferences
} from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All user routes require authentication
router.use(protect);

// Favorite routes
router.route('/favorites')
  .get(getFavorites)
  .post(addFavorite);

router.delete('/favorites/:id', removeFavorite);

// Search history routes
router.get('/history', getSearchHistory);
router.delete('/history', clearSearchHistory);

// Preferences route
router.put('/preferences', updatePreferences);

export default router;