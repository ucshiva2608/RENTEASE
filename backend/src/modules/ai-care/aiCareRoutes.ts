import { Router } from 'express';
import { AICareController } from './aiCareController';
import { authenticateToken } from '../../middleware/auth';
import { checkAIRateLimit } from '../../middleware/rateLimit';

const router = Router();

router.post('/ticket', authenticateToken, checkAIRateLimit, AICareController.createTicket);
router.get('/tickets', authenticateToken, AICareController.getTickets);
router.post('/quotation', authenticateToken, AICareController.manageQuotation);
router.post('/evidence', authenticateToken, AICareController.recordRepairEvidence);

export default router;
