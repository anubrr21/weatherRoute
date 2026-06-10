// backend/src/routes/history.js
import express from 'express';
import {
  saveSearch,
  getSearchHistory,
  clearSearchHistory,
  getSearchStats,
  saveRoute,
  getRouteHistory,
  deleteRoute,
  getRouteStats
} from '../controllers/historyController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All history routes require authentication
router.use(protect);

// Search history routes
router.post('/search', saveSearch);
router.get('/searches', getSearchHistory);
router.delete('/searches', clearSearchHistory);
router.get('/stats', getSearchStats);

// Route history routes
router.post('/route', saveRoute);
router.get('/routes', getRouteHistory);
router.delete('/route/:id', deleteRoute);
router.get('/route-stats', getRouteStats);

export default router;