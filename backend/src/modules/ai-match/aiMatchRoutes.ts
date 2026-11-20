import { Router } from 'express';
import { AIMatchController } from './aiMatchController';
import { checkAIRateLimit } from '../../middleware/rateLimit';

const router = Router();

router.post('/search', checkAIRateLimit, AIMatchController.searchProperties);

export default router;
