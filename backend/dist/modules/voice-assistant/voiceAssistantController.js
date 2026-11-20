"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceAssistantController = void 0;
const aiService_1 = require("../../services/aiService");
const auditService_1 = require("../../services/auditService");
class VoiceAssistantController {
    static async processVoiceQuery(req, res) {
        try {
            const { transcript, language } = req.body;
            if (!transcript || typeof transcript !== 'string') {
                res.status(400).json({ success: false, message: 'Speech transcript is required' });
                return;
            }
            const lang = (language === 'te' || language === 'hi' || language === 'en') ? language : 'en';
            // Run NLU on voice query
            const result = aiService_1.AIService.processVoiceIntent(transcript, lang);
            await auditService_1.AuditService.log({
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
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.VoiceAssistantController = VoiceAssistantController;
