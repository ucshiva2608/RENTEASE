import { Router } from 'express';
import { PropertyController } from './propertyController';
import { authenticateToken, requireRole } from '../../middleware/auth';

const router = Router();

router.get('/', PropertyController.getAllProperties);
router.get('/:id', PropertyController.getPropertyById);
router.post('/', authenticateToken, requireRole(['OWNER', 'ADMIN']), PropertyController.createProperty);
router.put('/:id', authenticateToken, requireRole(['OWNER', 'ADMIN']), PropertyController.updateProperty);

export default router;
