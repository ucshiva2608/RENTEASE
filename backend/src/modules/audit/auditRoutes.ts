import { Router, Response } from 'express';
import { AuthenticatedRequest, authenticateToken, requireRole } from '../../middleware/auth';
import { AuditService } from '../../services/auditService';

const router = Router();

router.get('/', authenticateToken, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 100;
    const logs = await AuditService.getRecentLogs(limit);
    res.json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/entity/:entityType/:entityId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { entityType, entityId } = req.params;
    const logs = await AuditService.getLogsForEntity(entityType, entityId);
    res.json({ success: true, count: logs.length, logs });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
