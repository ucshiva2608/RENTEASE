import { Router } from 'express';
import { VoiceAssistantController } from './voiceAssistantController';
import { checkAIRateLimit } from '../../middleware/rateLimit';

const router = Router();

router.post('/query', checkAIRateLimit, VoiceAssistantController.processVoiceQuery);

export default router;
