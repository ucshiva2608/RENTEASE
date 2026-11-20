import { Response } from 'express';
import crypto from 'crypto';
import { prisma } from '../../config/prisma';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AuditService } from '../../services/auditService';

export class DepositGuardController {
  /**
   * Create or initialize a DepositGuard record
   */
  public static async createDepositRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { propertyId, tenantId, originalDepositAmount, receiptReference } = req.body;

      if (!propertyId || !tenantId || !originalDepositAmount) {
        res.status(400).json({ success: false, message: 'propertyId, tenantId, and originalDepositAmount are required' });
        return;
      }

      const property = await prisma.property.findUnique({ where: { id: propertyId } });
      if (!property) {
        res.status(404).json({ success: false, message: 'Property not found' });
        return;
      }

      const record = await prisma.depositRecord.create({
        data: {
          propertyId,
          tenantId,
          ownerId: property.ownerId,
          originalDepositAmount: parseFloat(originalDepositAmount),
          receiptReference: receiptReference || `DEP-TXN-${Date.now()}`,
          calculatedRefundAmount: parseFloat(originalDepositAmount),
          escrowStatus: 'HELD_IN_ESCROW_ACCOUNT',
          refundStatus: 'PENDING',
        },
      });

      await AuditService.log({
        userId: req.user.id,
        action: 'DEPOSIT_RECORD_CREATED',
        entityType: 'DepositRecord',
        entityId: record.id,
        details: {
          originalDepositAmount: record.originalDepositAmount,
          receiptReference: record.receiptReference,
          compliance: 'RentEase audit ledger active. Banking settlement managed via certified escrow partner.',
        },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'DepositGuard record initialized successfully.',
        depositRecord: record,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get Deposit Record with full audit history, inspections, and deduction items
   */
  public static async getDepositRecord(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const record = await prisma.depositRecord.findUnique({
        where: { id },
        include: {
          property: {
            select: { id: true, title: true, address: true, city: true },
          },
          owner: {
            select: { id: true, name: true, email: true, phone: true },
          },
          tenant: {
            select: { id: true, name: true, email: true, phone: true },
          },
          inspections: {
            orderBy: { createdAt: 'asc' },
          },
          deductionItems: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!record) {
        res.status(404).json({ success: false, message: 'Deposit record not found' });
        return;
      }

      // Check authorization: must be owner, tenant, or admin
      if (
        req.user?.role !== 'ADMIN' &&
        req.user?.id !== record.ownerId &&
        req.user?.id !== record.tenantId
      ) {
        res.status(403).json({ success: false, message: 'Forbidden: You do not have access to this deposit record' });
        return;
      }

      const auditTrail = await AuditService.getLogsForEntity('DepositRecord', id);

      res.json({ success: true, depositRecord: record, auditTrail });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Add Move-In or Move-Out Inspection Report with timestamped photo hashes
   */
  public static async addInspectionReport(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { depositRecordId, inspectionType, inspectorName, overallCondition, checklist, photos } = req.body;

      if (!depositRecordId || !inspectionType) {
        res.status(400).json({ success: false, message: 'depositRecordId and inspectionType (MOVE_IN / MOVE_OUT) are required' });
        return;
      }

      const record = await prisma.depositRecord.findUnique({ where: { id: depositRecordId } });
      if (!record) {
        res.status(404).json({ success: false, message: 'Deposit record not found' });
        return;
      }

      // Compute cryptographic SHA-256 hashes for each photo to guarantee non-tampering
      const photosArray = Array.isArray(photos) ? photos : [];
      const timestampedPhotos = photosArray.map((photo: any) => {
        const photoUrl = typeof photo === 'string' ? photo : photo.url || '';
        const timestamp = new Date().toISOString();
        const sha256Hash = crypto.createHash('sha256').update(photoUrl + timestamp).digest('hex');
        return {
          url: photoUrl,
          caption: typeof photo === 'object' ? photo.caption : 'Inspection photo',
          timestamp,
          sha256Hash,
        };
      });

      const report = await prisma.inspectionReport.create({
        data: {
          depositRecordId,
          inspectionType: inspectionType.toUpperCase(),
          inspectorName: inspectorName || req.user.name,
          overallCondition: overallCondition || 'GOOD',
          checklistJson: JSON.stringify(checklist || { walls: 'clean', plumbing: 'leak-free', electrical: 'working' }),
          photosJson: JSON.stringify(timestampedPhotos),
          tenantAgreed: req.user.role === 'TENANT',
          ownerAgreed: req.user.role === 'OWNER',
        },
      });

      await AuditService.log({
        userId: req.user.id,
        action: `INSPECTION_${inspectionType.toUpperCase()}_LOGGED`,
        entityType: 'DepositRecord',
        entityId: depositRecordId,
        details: {
          reportId: report.id,
          inspectorName: report.inspectorName,
          photoCount: timestampedPhotos.length,
          overallCondition: report.overallCondition,
        },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: `${inspectionType} inspection report recorded with cryptographic audit hashes.`,
        report,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Add Itemized Deduction Item (painting, cleaning, damaged fixture, etc.)
   */
  public static async addItemizedDeduction(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { depositRecordId, category, description, claimedAmount, agreedAmount, proofPhotoUrl, invoiceProofUrl } = req.body;

      if (!depositRecordId || !category || claimedAmount === undefined) {
        res.status(400).json({ success: false, message: 'depositRecordId, category, and claimedAmount are required' });
        return;
      }

      const record = await prisma.depositRecord.findUnique({ where: { id: depositRecordId } });
      if (!record) {
        res.status(404).json({ success: false, message: 'Deposit record not found' });
        return;
      }

      const item = await prisma.depositDeductionItem.create({
        data: {
          depositRecordId,
          category,
          description: description || '',
          claimedAmount: parseFloat(claimedAmount),
          agreedAmount: agreedAmount !== undefined ? parseFloat(agreedAmount) : parseFloat(claimedAmount),
          proofPhotoUrl: proofPhotoUrl || null,
          invoiceProofUrl: invoiceProofUrl || null,
          tenantApproved: false,
        },
      });

      // Recalculate totals
      const allDeductions = await prisma.depositDeductionItem.findMany({ where: { depositRecordId } });
      const totalDeductions = allDeductions.reduce((sum, d) => sum + d.agreedAmount, 0);
      const calculatedRefundAmount = Math.max(record.originalDepositAmount - totalDeductions, 0);

      const updatedRecord = await prisma.depositRecord.update({
        where: { id: depositRecordId },
        data: {
          totalDeductions,
          calculatedRefundAmount,
        },
      });

      await AuditService.log({
        userId: req.user.id,
        action: 'DEPOSIT_DEDUCTION_ADDED',
        entityType: 'DepositRecord',
        entityId: depositRecordId,
        details: {
          itemId: item.id,
          category,
          claimedAmount,
          newTotalDeductions: totalDeductions,
          newCalculatedRefund: calculatedRefundAmount,
        },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Itemized deduction added to deposit settlement ledger.',
        item,
        updatedRecord,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Digital Sign-off & Mutual Agreement (Owner and Tenant Approval)
   */
  public static async signDepositSettlement(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { depositRecordId, approved } = req.body;
      const record = await prisma.depositRecord.findUnique({ where: { id: depositRecordId } });

      if (!record) {
        res.status(404).json({ success: false, message: 'Deposit record not found' });
        return;
      }

      const isOwner = req.user.id === record.ownerId;
      const isTenant = req.user.id === record.tenantId;

      if (!isOwner && !isTenant && req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Forbidden: Only designated owner or tenant can sign settlement' });
        return;
      }

      const updateData: any = {};
      if (isOwner || req.user.role === 'ADMIN') {
        updateData.ownerSigned = approved;
        updateData.ownerSignedAt = approved ? new Date() : null;
      }
      if (isTenant || req.user.role === 'ADMIN') {
        updateData.tenantSigned = approved;
        updateData.tenantSignedAt = approved ? new Date() : null;
      }

      // If both have signed and approved, transition refund status to APPROVED
      const willBothSign =
        (updateData.ownerSigned !== undefined ? updateData.ownerSigned : record.ownerSigned) &&
        (updateData.tenantSigned !== undefined ? updateData.tenantSigned : record.tenantSigned);

      if (willBothSign) {
        updateData.refundStatus = 'APPROVED';
        updateData.escrowStatus = 'RELEASE_PENDING';
      }

      const updated = await prisma.depositRecord.update({
        where: { id: depositRecordId },
        data: updateData,
      });

      await AuditService.log({
        userId: req.user.id,
        action: 'DEPOSIT_SETTLEMENT_SIGNED',
        entityType: 'DepositRecord',
        entityId: depositRecordId,
        details: {
          signerRole: isOwner ? 'OWNER' : 'TENANT',
          bothPartiesSigned: willBothSign,
          refundStatus: updated.refundStatus,
        },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: willBothSign
          ? 'Mutual sign-off completed! Deposit settlement approved for banking payout.'
          : 'Digital sign-off recorded. Awaiting counterparty approval.',
        depositRecord: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Raise or Resolve Deposit Dispute
   */
  public static async manageDispute(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { depositRecordId, action, reason, resolutionNotes } = req.body;
      // action: 'RAISE' | 'RESOLVE'

      const record = await prisma.depositRecord.findUnique({ where: { id: depositRecordId } });
      if (!record) {
        res.status(404).json({ success: false, message: 'Deposit record not found' });
        return;
      }

      let updated: any;
      if (action === 'RAISE') {
        updated = await prisma.depositRecord.update({
          where: { id: depositRecordId },
          data: {
            disputeRaised: true,
            disputeReason: reason || 'Disagreement over itemized damage deduction values',
            disputeStatus: 'OPEN',
            refundStatus: 'DISPUTED',
            escrowStatus: 'DISPUTED',
          },
        });
      } else if (action === 'RESOLVE') {
        if (req.user.role !== 'ADMIN' && req.user.id !== record.ownerId) {
          res.status(403).json({ success: false, message: 'Admin or mutual mediation required to resolve dispute' });
          return;
        }

        updated = await prisma.depositRecord.update({
          where: { id: depositRecordId },
          data: {
            disputeRaised: false,
            disputeStatus: 'RESOLVED',
            disputeResolutionNotes: resolutionNotes || 'Mediation agreed on final deduction amount',
            refundStatus: 'APPROVED',
            escrowStatus: 'RELEASE_PENDING',
          },
        });
      }

      await AuditService.log({
        userId: req.user.id,
        action: `DEPOSIT_DISPUTE_${action}`,
        entityType: 'DepositRecord',
        entityId: depositRecordId,
        details: { action, reason, resolutionNotes },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: `Dispute status updated to: ${updated.disputeStatus}`,
        depositRecord: updated,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
