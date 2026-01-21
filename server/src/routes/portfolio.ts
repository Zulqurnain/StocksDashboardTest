import { Router } from 'express';
import { getPortfolioSummary } from '../controllers/portfolio';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/summary', getPortfolioSummary);

export default router;
