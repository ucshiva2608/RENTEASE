"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ownerCopilotController_1 = require("./ownerCopilotController");
const auth_1 = require("../../middleware/auth");
const rateLimit_1 = require("../../middleware/rateLimit");
const router = (0, express_1.Router)();
router.post('/query', auth_1.authenticateToken, (0, auth_1.requireRole)(['OWNER', 'ADMIN']), rateLimit_1.checkAIRateLimit, ownerCopilotController_1.OwnerCopilotController.queryCopilot);
exports.default = router;
