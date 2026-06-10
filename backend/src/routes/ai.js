// backend/src/routes/ai.js
import express from 'express';
import { chat, clearSession, getFunctions } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/chat', chat);
router.delete('/session', clearSession);
router.get('/functions', getFunctions);

export default router;