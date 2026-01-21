import { Router } from 'express';
import { getTransactions, createTransaction } from '../controllers/transactions';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', getTransactions);
router.post('/', createTransaction);

export default router;
