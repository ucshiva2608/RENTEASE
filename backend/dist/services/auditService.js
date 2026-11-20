"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const prisma_1 = require("../config/prisma");
class AuditService {
    static async log(params) {
        try {
            await prisma_1.prisma.auditLog.create({
                data: {
                    userId: params.userId || null,
                    action: params.action,
                    entityType: params.entityType,
                    entityId: params.entityId || null,
                    detailsJson: JSON.stringify(params.details),
                    ipAddress: params.ipAddress || '127.0.0.1',
                },
            });
        }
        catch (error) {
            console.error('Failed to write audit log:', error);
            // Audit log failures should not crash user operations, but are logged to stderr
        }
    }
    static async getLogsForEntity(entityType, entityId) {
        return prisma_1.prisma.auditLog.findMany({
            where: { entityType, entityId },
            orderBy: { timestamp: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
    }
    static async getRecentLogs(limit = 100) {
        return prisma_1.prisma.auditLog.findMany({
            take: limit,
            orderBy: { timestamp: 'desc' },
            include: {
                user: {
                    select: { id: true, name: true, email: true, role: true },
                },
            },
        });
    }
}
exports.AuditService = AuditService;
