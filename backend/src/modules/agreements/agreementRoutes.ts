import { Router } from 'express';
import { AgreementIntelligenceController } from './agreementController';
import { authenticateToken } from '../../middleware/auth';
import { checkAIRateLimit } from '../../middleware/rateLimit';

const router = Router();

router.post('/analyze', authenticateToken, checkAIRateLimit, AgreementIntelligenceController.analyzeAgreement);
router.post('/create', authenticateToken, AgreementIntelligenceController.createAgreement);
router.get('/renewal-alerts', authenticateToken, AgreementIntelligenceController.getRenewalAlerts);

export default router;
