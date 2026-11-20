import { Router } from 'express';
import { DepositGuardController } from './depositGuardController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

router.post('/record', authenticateToken, DepositGuardController.createDepositRecord);
router.get('/record/:id', authenticateToken, DepositGuardController.getDepositRecord);
router.post('/inspection', authenticateToken, DepositGuardController.addInspectionReport);
router.post('/deduction', authenticateToken, DepositGuardController.addItemizedDeduction);
router.post('/sign', authenticateToken, DepositGuardController.signDepositSettlement);
router.post('/dispute', authenticateToken, DepositGuardController.manageDispute);

export default router;
