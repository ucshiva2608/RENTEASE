import { prisma } from '../config/prisma';

export interface AuditLogParams {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  details: Record<string, any>;
  ipAddress?: string;
}

export class AuditService {
  public static async log(params: AuditLogParams): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId: params.userId || null,
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId || null,
          detailsJson: JSON.stringify(params.details),
          ipAddress: params.ipAddress || '127.0.0.1',
        },
      });
    } catch (error) {
      console.error('Failed to write audit log:', error);
      // Audit log failures should not crash user operations, but are logged to stderr
    }
  }

  public static async getLogsForEntity(entityType: string, entityId: string) {
    return prisma.auditLog.findMany({
      where: { entityType, entityId },
      orderBy: { timestamp: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
  }

  public static async getRecentLogs(limit = 100) {
    return prisma.auditLog.findMany({
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
