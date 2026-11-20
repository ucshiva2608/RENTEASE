"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const voiceAssistantController_1 = require("./voiceAssistantController");
const rateLimit_1 = require("../../middleware/rateLimit");
const router = (0, express_1.Router)();
router.post('/query', rateLimit_1.checkAIRateLimit, voiceAssistantController_1.VoiceAssistantController.processVoiceQuery);
exports.default = router;
