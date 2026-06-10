// backend/src/routes/advancedAI.js
import express from 'express';
import { chat, clearSession } from '../controllers/advancedAIController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/chat', chat);
router.delete('/session', clearSession);

export default router;