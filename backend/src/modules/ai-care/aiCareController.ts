import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AIService } from '../../services/aiService';
import { AuditService } from '../../services/auditService';

export class AICareController {
  /**
   * Create Maintenance Ticket from text, image, or voice input
   */
  public static async createTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const {
        propertyId,
        title,
        description,
        complaintInputType, // 'TEXT' | 'IMAGE' | 'VOICE'
        audioRecordingUrl,
        audioTranscript,
        photoUrls,
      } = req.body;

      if (!propertyId || (!description && !audioTranscript)) {
        res.status(400).json({ success: false, message: 'propertyId and description/transcript are required' });
        return;
      }

      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!property) {
        res.status(404).json({ success: false, message: 'Property not found' });
        return;
      }

      const complaintText = (description || audioTranscript || title || '').toString();

      // Step 1: AI classification, urgency detection & vendor recommendation
      const aiResult = AIService.classifyMaintenanceComplaint(complaintText);

      // Step 2: Compute SLA deadline
      const now = new Date();
      const slaDeadline = new Date(now.getTime() + aiResult.slaHours * 60 * 60 * 1000);

      const ticket = await prisma.maintenanceTicket.create({
        data: {
          propertyId,
          tenantId: req.user.id,
          title: title || `${aiResult.category.replace('_', ' ')} Repair Request`,
          description: complaintText,
          complaintInputType: complaintInputType || 'TEXT',
          audioRecordingUrl: audioRecordingUrl || null,
          audioTranscript: audioTranscript || null,
          photoUrlsJson: photoUrls ? JSON.stringify(photoUrls) : null,
          aiClassifiedCategory: aiResult.category,
          aiSuggestedUrgency: aiResult.urgency,
          slaHours: aiResult.slaHours,
          slaDeadline,
          status: 'OPEN',
          recommendedProviderJson: JSON.stringify(aiResult.recommendedProvider),
          assignedVendorName: aiResult.recommendedProvider.name,
          assignedVendorPhone: aiResult.recommendedProvider.phone,
        },
      });

      await AuditService.log({
        userId: req.user.id,
        action: 'MAINTENANCE_TICKET_CREATED',
        entityType: 'MaintenanceTicket',
        entityId: ticket.id,
        details: {
          category: ticket.aiClassifiedCategory,
          urgency: ticket.aiSuggestedUrgency,
          slaHours: ticket.slaHours,
          recommendedVendor: aiResult.recommendedProvider.name,
        },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Maintenance ticket created with AI assessment and provider matching.',
        ticket,
        aiAssessment: {
          category: aiResult.category,
          urgency: aiResult.urgency,
          slaHours: aiResult.slaHours,
          slaDeadline,
          reasoning: aiResult.reasoning,
          recommendedProvider: aiResult.recommendedProvider,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get all tickets for a property or tenant/owner
   */
  public static async getTickets(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { propertyId, status } = req.query;
      const where: any = {};

      if (propertyId) {
        where.propertyId = String(propertyId);
      }

      if (status) {
        where.status = String(status);
      }

      // Role isolation: Tenants see their tickets; Owners see tickets on their properties; Admins see all
      if (req.user.role === 'TENANT') {
        where.tenantId = req.user.id;
      } else if (req.user.role === 'OWNER') {
        where.property = { ownerId: req.user.id };
      }

      let tickets = await prisma.maintenanceTicket.findMany({
        where,
        include: {
          property: {
            select: { id: true, title: true, address: true, city: true, ownerId: true },
          },
          tenant: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Auto-escalation check: check if any OPEN ticket has passed its SLA deadline
      const now = new Date();
      const escalatedTickets = await Promise.all(
        tickets.map(async ticket => {
          if (
            (ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') &&
            !ticket.isEscalated &&
            now > new Date(ticket.slaDeadline)
          ) {
            const updated = await prisma.maintenanceTicket.update({
              where: { id: ticket.id },
              data: {
                isEscalated: true,
                escalatedAt: now,
                status: 'ESCALATED',
              },
            });
            return updated;
          }
          return ticket;
        })
      );

      res.json({ success: true, count: escalatedTickets.length, tickets: escalatedTickets });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Submit or Approve Vendor Quotation
   */
  public static async manageQuotation(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { ticketId, quoteAmount, quoteDescription, approved } = req.body;

      const ticket = await prisma.maintenanceTicket.findUnique({
        where: { id: ticketId },
        include: { property: true },
      });

      if (!ticket) {
        res.status(404).json({ success: false, message: 'Maintenance ticket not found' });
        return;
      }

      const isOwner = req.user.id === ticket.property.ownerId;
      const isAdmin = req.user.role === 'ADMIN';

      if (approved !== undefined) {
        // Owner decision
        if (!isOwner && !isAdmin) {
          res.status(403).json({ success: false, message: 'Forbidden: Only the property owner or admin can approve quotations' });
          return;
        }

        const updated = await prisma.maintenanceTicket.update({
          where: { id: ticketId },
          data: {
            quoteApprovedByOwner: approved,
            status: approved ? 'IN_PROGRESS' : 'AWAITING_OWNER_APPROVAL',
          },
        });

        await AuditService.log({
          userId: req.user.id,
          action: approved ? 'MAINTENANCE_QUOTE_APPROVED' : 'MAINTENANCE_QUOTE_REJECTED',
          entityType: 'MaintenanceTicket',
          entityId: ticketId,
          details: { approved, quoteAmount: ticket.quoteAmount },
          ipAddress: req.ip,
        });

        res.json({
          success: true,
          message: approved ? 'Quotation approved. Work order authorized.' : 'Quotation declined.',
          ticket: updated,
        });
        return;
      }

      // Add quotation details
      const updated = await prisma.maintenanceTicket.update({
        where: { id: ticketId },
        data: {
          quoteAmount: parseFloat(quoteAmount),
          quoteDescription: quoteDescription || 'Vendor estimate for labor and replacement components',
          status: 'AWAITING_OWNER_APPROVAL',
        },
      });

      await AuditService.log({
        userId: req.user.id,
        action: 'MAINTENANCE_QUOTE_SUBMITTED',
        entityType: 'MaintenanceTicket',
        entityId: ticketId,
        details: { quoteAmount, quoteDescription },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Quotation submitted for property owner authorization.',
        ticket: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Submit Repair Evidence (Before / After Photos) and Complete Ticket
   */
  public static async recordRepairEvidence(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { ticketId, beforePhotoUrl, afterPhotoUrl, tenantSatisfactionRating } = req.body;

      const ticket = await prisma.maintenanceTicket.findUnique({ where: { id: ticketId } });
      if (!ticket) {
        res.status(404).json({ success: false, message: 'Ticket not found' });
        return;
      }

      const evidence = {
        beforePhotoUrl: beforePhotoUrl || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
        afterPhotoUrl: afterPhotoUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
        completedAt: new Date().toISOString(),
      };

      const updated = await prisma.maintenanceTicket.update({
        where: { id: ticketId },
        data: {
          status: 'COMPLETED',
          repairEvidencePhotosJson: JSON.stringify(evidence),
          tenantSatisfactionRating: tenantSatisfactionRating ? parseInt(tenantSatisfactionRating, 10) : 5,
        },
      });

      await AuditService.log({
        userId: req.user.id,
        action: 'MAINTENANCE_TICKET_COMPLETED',
        entityType: 'MaintenanceTicket',
        entityId: ticketId,
        details: {
          evidence,
          tenantSatisfactionRating: updated.tenantSatisfactionRating,
        },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Repair evidence recorded and maintenance ticket closed.',
        ticket: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
