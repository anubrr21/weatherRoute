// backend/src/routes/auth.js
import express from 'express';
import { register, login, getMe, updateProfile, logout } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes (require authentication)
router.use(protect); // All routes below this will require authentication
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.post('/logout', logout);

export default router;