"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgreementIntelligenceController = void 0;
const prisma_1 = require("../../config/prisma");
const aiService_1 = require("../../services/aiService");
const auditService_1 = require("../../services/auditService");
class AgreementIntelligenceController {
    /**
     * Analyze Rental Agreement Document / Draft
     */
    static async analyzeAgreement(req, res) {
        try {
            const { agreementText, propertyId } = req.body;
            if (!agreementText || typeof agreementText !== 'string' || agreementText.trim().length === 0) {
                res.status(400).json({ success: false, message: 'agreementText is required' });
                return;
            }
            let property = null;
            if (propertyId) {
                property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
            }
            // Step 1: Run AI analysis and extraction
            const analysis = aiService_1.AIService.analyzeRentalAgreement(agreementText, property);
            // Step 2: Audit log
            await auditService_1.AuditService.log({
                userId: req.user?.id,
                action: 'AGREEMENT_ANALYZED',
                entityType: 'RentalAgreement',
                entityId: propertyId || undefined,
                details: {
                    monthlyRent: analysis.monthlyRent,
                    securityDeposit: analysis.securityDeposit,
                    riskScore: analysis.riskScore,
                    missingAlertsCount: analysis.missingInformationAlerts.length,
                    discrepanciesCount: analysis.discrepanciesWithListing.length,
                },
                ipAddress: req.ip,
            });
            res.json({
                success: true,
                disclaimer: 'RentEase AI Agreement Intelligence provides automated linguistic extraction for informational review only. This document does not constitute certified legal counsel or formal statutory representation.',
                analysis,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Create or Save a Formal Rental Agreement with AI extracted summary
     */
    static async createAgreement(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const { propertyId, tenantId, startDate, endDate, monthlyRent, securityDeposit, lockInPeriodMonths, noticePeriodDays, escalationPercent, stateJurisdiction, agreementDocumentText, } = req.body;
            if (!propertyId || !tenantId || !startDate || !endDate) {
                res.status(400).json({ success: false, message: 'propertyId, tenantId, startDate, and endDate are required' });
                return;
            }
            const property = await prisma_1.prisma.property.findUnique({ where: { id: propertyId } });
            if (!property) {
                res.status(404).json({ success: false, message: 'Property not found' });
                return;
            }
            // Run AI analysis
            const analysis = aiService_1.AIService.analyzeRentalAgreement(agreementDocumentText || `Rental agreement for ${property.address}. Monthly rent ₹${monthlyRent || property.monthlyRent}. Deposit ₹${securityDeposit || property.securityDeposit}.`, property);
            const agreement = await prisma_1.prisma.rentalAgreement.create({
                data: {
                    propertyId,
                    ownerId: property.ownerId,
                    tenantId,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    monthlyRent: monthlyRent ? parseFloat(monthlyRent) : analysis.monthlyRent,
                    securityDeposit: securityDeposit ? parseFloat(securityDeposit) : analysis.securityDeposit,
                    lockInPeriodMonths: lockInPeriodMonths ? parseInt(lockInPeriodMonths, 10) : analysis.lockInPeriodMonths,
                    noticePeriodDays: noticePeriodDays ? parseInt(noticePeriodDays, 10) : analysis.noticePeriodDays,
                    escalationPercent: escalationPercent ? parseFloat(escalationPercent) : analysis.escalationPercent,
                    stateJurisdiction: stateJurisdiction || 'Telangana',
                    status: 'ACTIVE',
                    aiSummaryEn: analysis.summaryEn,
                    aiSummaryTe: analysis.summaryTe,
                    missingInformationAlerts: JSON.stringify(analysis.missingInformationAlerts),
                    listingDiscrepancyNotes: JSON.stringify(analysis.discrepanciesWithListing),
                },
            });
            await auditService_1.AuditService.log({
                userId: req.user.id,
                action: 'AGREEMENT_CREATED',
                entityType: 'RentalAgreement',
                entityId: agreement.id,
                details: {
                    propertyId,
                    tenantId,
                    monthlyRent: agreement.monthlyRent,
                    endDate: agreement.endDate,
                },
                ipAddress: req.ip,
            });
            res.status(201).json({
                success: true,
                message: 'Rental agreement registered and analyzed.',
                agreement,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Get Expiring Agreements & Proactive Renewal Reminders
     */
    static async getRenewalAlerts(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const daysThreshold = req.query.days ? parseInt(String(req.query.days), 10) : 60;
            const targetDate = new Date();
            targetDate.setDate(targetDate.getDate() + daysThreshold);
            const where = {
                status: 'ACTIVE',
                endDate: { lte: targetDate },
            };
            if (req.user.role === 'OWNER') {
                where.ownerId = req.user.id;
            }
            else if (req.user.role === 'TENANT') {
                where.tenantId = req.user.id;
            }
            const expiringAgreements = await prisma_1.prisma.rentalAgreement.findMany({
                where,
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
                },
                orderBy: { endDate: 'asc' },
            });
            const alerts = expiringAgreements.map(agr => {
                const msRemaining = new Date(agr.endDate).getTime() - new Date().getTime();
                const daysRemaining = Math.max(Math.ceil(msRemaining / (1000 * 60 * 60 * 24)), 0);
                const noticeWindowDate = new Date(new Date(agr.endDate).getTime() - agr.noticePeriodDays * 24 * 60 * 60 * 1000);
                const isWithinNoticeWindow = new Date() >= noticeWindowDate;
                return {
                    agreementId: agr.id,
                    property: agr.property,
                    tenant: agr.tenant,
                    owner: agr.owner,
                    monthlyRent: agr.monthlyRent,
                    endDate: agr.endDate,
                    daysRemaining,
                    noticePeriodDays: agr.noticePeriodDays,
                    isWithinNoticeWindow,
                    renewalActionSuggested: isWithinNoticeWindow
                        ? 'URGENT: Lease is within mandatory notice window. Solicit renewal contract or move-out protocol immediately.'
                        : `Schedule renewal negotiation (${daysRemaining} days remaining).`,
                    teluguSummary: agr.aiSummaryTe,
                    englishSummary: agr.aiSummaryEn,
                };
            });
            res.json({ success: true, count: alerts.length, alerts });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.AgreementIntelligenceController = AgreementIntelligenceController;
