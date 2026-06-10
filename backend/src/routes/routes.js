import express from 'express';

console.log("✅ ROUTES.JS LOADED");

import { planRoute, getRouteAlternatives } from '../controllers/routeController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'Routes API working'
  });
});

router.use(protect);

router.post('/plan', planRoute);
router.post('/alternatives', getRouteAlternatives);

export default router;