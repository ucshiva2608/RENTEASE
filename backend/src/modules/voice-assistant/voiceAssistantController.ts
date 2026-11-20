import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AIService } from '../../services/aiService';
import { AuditService } from '../../services/auditService';

export class VoiceAssistantController {
  public static async processVoiceQuery(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { transcript, language } = req.body;

      if (!transcript || typeof transcript !== 'string') {
        res.status(400).json({ success: false, message: 'Speech transcript is required' });
        return;
      }

      const lang = (language === 'te' || language === 'hi' || language === 'en') ? language : 'en';

      // Run NLU on voice query
      const result = AIService.processVoiceIntent(transcript, lang);

      await AuditService.log({
        userId: req.user?.id,
        action: 'VOICE_ASSISTANT_QUERY',
        entityType: 'User',
        entityId: req.user?.id,
        details: { transcript, language: lang, intent: result.intent },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        transcript,
        language: lang,
        result,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
