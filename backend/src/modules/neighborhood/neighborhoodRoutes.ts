import { Router } from 'express';
import { NeighborhoodController } from './neighborhoodController';

const router = Router();

router.get('/:propertyId', NeighborhoodController.getNeighborhoodInfo);

export default router;
