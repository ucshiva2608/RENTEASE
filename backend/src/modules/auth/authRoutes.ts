import { Router } from 'express';
import { AuthController } from './authController';
import { authenticateToken, requireConsent } from '../../middleware/auth';

const router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.get('/me', authenticateToken, AuthController.me);
router.put('/consent', authenticateToken, AuthController.updateConsent);
router.post('/verify-identity', authenticateToken, requireConsent, AuthController.verifyIdentity);

export default router;
