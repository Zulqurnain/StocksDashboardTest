import { Router } from 'express';
import { register, login, logout, me } from '../controllers/auth';
import { authMiddleware } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authMiddleware, me);

export default router;
