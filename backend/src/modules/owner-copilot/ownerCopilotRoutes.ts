import { Router } from 'express';
import { OwnerCopilotController } from './ownerCopilotController';
import { authenticateToken, requireRole } from '../../middleware/auth';
import { checkAIRateLimit } from '../../middleware/rateLimit';

const router = Router();

router.post('/query', authenticateToken, requireRole(['OWNER', 'ADMIN']), checkAIRateLimit, OwnerCopilotController.queryCopilot);

export default router;
