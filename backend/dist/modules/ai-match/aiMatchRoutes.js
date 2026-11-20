"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiMatchController_1 = require("./aiMatchController");
const rateLimit_1 = require("../../middleware/rateLimit");
const router = (0, express_1.Router)();
router.post('/search', rateLimit_1.checkAIRateLimit, aiMatchController_1.AIMatchController.searchProperties);
exports.default = router;
