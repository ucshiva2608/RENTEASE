"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const auditService_1 = require("../../services/auditService");
const router = (0, express_1.Router)();
router.get('/', auth_1.authenticateToken, (0, auth_1.requireRole)(['ADMIN']), async (req, res) => {
    try {
        const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
        const logs = await auditService_1.AuditService.getRecentLogs(limit);
        res.json({ success: true, count: logs.length, logs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
router.get('/entity/:entityType/:entityId', auth_1.authenticateToken, async (req, res) => {
    try {
        const { entityType, entityId } = req.params;
        const logs = await auditService_1.AuditService.getLogsForEntity(entityType, entityId);
        res.json({ success: true, count: logs.length, logs });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
exports.default = router;
