import { Router } from 'express';
import { TrustVerificationController } from './trustController';
import { authenticateToken, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/badge/:propertyId', TrustVerificationController.getPropertyVerificationBadge);
router.post('/submit', authenticateToken, requireRole(['OWNER', 'ADMIN']), TrustVerificationController.submitVerification);
router.get('/admin/pending', authenticateToken, requireRole(['ADMIN']), TrustVerificationController.getPendingVerifications);
router.post('/admin/review', authenticateToken, requireRole(['ADMIN']), TrustVerificationController.adminReviewVerification);

export default router;
