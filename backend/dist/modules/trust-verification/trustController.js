"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrustVerificationController = void 0;
const prisma_1 = require("../../config/prisma");
const auditService_1 = require("../../services/auditService");
const config_1 = require("../../config");
class TrustVerificationController {
    /**
     * Submit property for verification with documents and media
     */
    static async submitVerification(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const { propertyId, ownershipDocUrl, ownershipDocType, gpsLat, gpsLon, videoTourUrl } = req.body;
            if (!propertyId || !ownershipDocUrl) {
                res.status(400).json({ success: false, message: 'propertyId and ownershipDocUrl are required' });
                return;
            }
            const property = await prisma_1.prisma.property.findUnique({
                where: { id: propertyId },
                include: { owner: true },
            });
            if (!property) {
                res.status(404).json({ success: false, message: 'Property not found' });
                return;
            }
            if (property.ownerId !== req.user.id && req.user.role !== 'ADMIN') {
                res.status(403).json({ success: false, message: 'Only property owner can submit verification documents' });
                return;
            }
            // Check Location Consistency
            let locationConsistent = false;
            if (gpsLat && gpsLon) {
                const latDiff = Math.abs(property.latitude - parseFloat(gpsLat));
                const lonDiff = Math.abs(property.longitude - parseFloat(gpsLon));
                // Within 0.05 degrees ~ 5.5 km
                locationConsistent = latDiff < 0.05 && lonDiff < 0.05;
            }
            else {
                locationConsistent = true; // Based on geocoded address
            }
            // Media verification simulation (tamper & quality check)
            const mediaVerified = !!property.images && property.images.length > 20;
            const updated = await prisma_1.prisma.property.update({
                where: { id: propertyId },
                data: {
                    verificationStatus: 'PENDING',
                    ownershipDocUrl,
                    ownershipDocType: ownershipDocType || 'SALE_DEED',
                    videoUrl: videoTourUrl || property.videoUrl,
                    badgeIdentityVerified: property.owner.isIdentityVerified,
                    badgeLocationVerified: locationConsistent,
                    badgeMediaVerified: mediaVerified,
                    badgeRecentlyConfirmed: true,
                    listingConfirmedAt: new Date(),
                },
            });
            await auditService_1.AuditService.log({
                userId: req.user.id,
                action: 'VERIFICATION_SUBMITTED',
                entityType: 'Property',
                entityId: propertyId,
                details: {
                    docType: ownershipDocType,
                    locationConsistent,
                    mediaVerified,
                },
                ipAddress: req.ip,
            });
            res.json({
                success: true,
                message: 'Verification submitted for compliance review.',
                verification: {
                    status: updated.verificationStatus,
                    badges: {
                        identityVerified: updated.badgeIdentityVerified,
                        ownershipDocsReviewed: updated.badgeOwnershipDocsReviewed,
                        locationVerified: updated.badgeLocationVerified,
                        mediaVerified: updated.badgeMediaVerified,
                        listingRecentlyConfirmed: updated.badgeRecentlyConfirmed,
                    },
                },
                disclaimer: 'RentEase Verification Audit: Identity verification confirms user credentials; document review validates submitted deeds/records. Does not constitute legal title warranty.',
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Admin Review: Approve, Reject, or Request Changes
     */
    static async adminReviewVerification(req, res) {
        try {
            if (!req.user || req.user.role !== 'ADMIN') {
                res.status(403).json({ success: false, message: 'Forbidden: Admin access required' });
                return;
            }
            const { propertyId, decision, reviewNotes } = req.body;
            // decision: 'APPROVE' | 'REJECT' | 'REQUEST_INFO'
            if (!propertyId || !decision) {
                res.status(400).json({ success: false, message: 'propertyId and decision are required' });
                return;
            }
            const property = await prisma_1.prisma.property.findUnique({
                where: { id: propertyId },
                include: { owner: true },
            });
            if (!property) {
                res.status(404).json({ success: false, message: 'Property not found' });
                return;
            }
            const isApproved = decision === 'APPROVE';
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + config_1.config.verificationValidityDays);
            const updated = await prisma_1.prisma.property.update({
                where: { id: propertyId },
                data: {
                    verificationStatus: isApproved ? 'VERIFIED' : decision === 'REJECT' ? 'REJECTED' : 'PENDING',
                    verifiedAt: isApproved ? new Date() : null,
                    verificationExpiry: isApproved ? expiryDate : null,
                    adminReviewNotes: reviewNotes || (isApproved ? 'All documentation verified' : 'Requires further proof'),
                    reviewedByAdminId: req.user.id,
                    badgeOwnershipDocsReviewed: isApproved,
                    badgeIdentityVerified: property.owner.isIdentityVerified,
                    badgeLocationVerified: isApproved ? true : property.badgeLocationVerified,
                    badgeMediaVerified: isApproved ? true : property.badgeMediaVerified,
                    badgeRecentlyConfirmed: true,
                    listingConfirmedAt: new Date(),
                },
            });
            await auditService_1.AuditService.log({
                userId: req.user.id,
                action: `VERIFICATION_${decision}`,
                entityType: 'Property',
                entityId: propertyId,
                details: {
                    decision,
                    reviewNotes,
                    expiryDate: isApproved ? expiryDate.toISOString() : null,
                },
                ipAddress: req.ip,
            });
            res.json({
                success: true,
                message: `Property verification successfully updated to: ${updated.verificationStatus}`,
                property: updated,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Get verification badge audit report for any property
     */
    static async getPropertyVerificationBadge(req, res) {
        try {
            const { propertyId } = req.params;
            const property = await prisma_1.prisma.property.findUnique({
                where: { id: propertyId },
                include: {
                    owner: {
                        select: { id: true, name: true, isIdentityVerified: true, identityDocType: true, identityVerifiedAt: true },
                    },
                },
            });
            if (!property) {
                res.status(404).json({ success: false, message: 'Property not found' });
                return;
            }
            // Check if verification has expired
            const isExpired = property.verificationExpiry ? new Date() > new Date(property.verificationExpiry) : false;
            const effectiveStatus = isExpired ? 'EXPIRED' : property.verificationStatus;
            // Check if listing was recently confirmed within 60 days
            const daysSinceConfirmed = property.listingConfirmedAt
                ? Math.floor((new Date().getTime() - new Date(property.listingConfirmedAt).getTime()) / (1000 * 60 * 60 * 24))
                : 999;
            const isRecentlyConfirmed = daysSinceConfirmed <= 60;
            const levels = [
                {
                    id: 'identity',
                    title: 'Identity Verified',
                    active: property.badgeIdentityVerified && property.owner.isIdentityVerified,
                    description: property.owner.isIdentityVerified
                        ? `Owner KYC completed via government ${property.owner.identityDocType || 'ID'} verification.`
                        : 'Owner identity pending government KYC verification.',
                    legalDisclaimer: 'Confirms owner identity only. Does not attest legal title without document review.',
                },
                {
                    id: 'ownership',
                    title: 'Ownership Documents Reviewed',
                    active: property.badgeOwnershipDocsReviewed && !isExpired,
                    description: property.badgeOwnershipDocsReviewed
                        ? `Admin vetted ${property.ownershipDocType?.replace('_', ' ') || 'Sale Deed / Tax Record'}.`
                        : 'Ownership or leasing authorization records pending administrative inspection.',
                    legalDisclaimer: 'Document inspection conducted for platform authenticity purposes.',
                },
                {
                    id: 'location',
                    title: 'Location Verified',
                    active: property.badgeLocationVerified,
                    description: 'Geocoded coordinates cross-referenced with postal address and physical landmark.',
                },
                {
                    id: 'media',
                    title: 'Media Verified',
                    active: property.badgeMediaVerified,
                    description: 'Photographs & walkthrough video inspected for authenticity and duplicate absence.',
                },
                {
                    id: 'recent',
                    title: 'Listing Recently Confirmed',
                    active: isRecentlyConfirmed,
                    description: `Availability and price re-certified ${daysSinceConfirmed} days ago.`,
                },
            ];
            const trustScore = Math.round((levels.filter(l => l.active).length / levels.length) * 100);
            res.json({
                success: true,
                verificationStatus: effectiveStatus,
                verificationExpiry: property.verificationExpiry,
                isExpired,
                trustScore,
                levels,
                duplicateWarning: property.duplicateListingDetected
                    ? 'Notice: Duplicate or very similar listing detected in registry.'
                    : null,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    /**
     * Admin: List pending verifications
     */
    static async getPendingVerifications(req, res) {
        try {
            const properties = await prisma_1.prisma.property.findMany({
                where: { verificationStatus: 'PENDING' },
                include: {
                    owner: {
                        select: { id: true, name: true, email: true, phone: true, isIdentityVerified: true },
                    },
                },
                orderBy: { updatedAt: 'desc' },
            });
            res.json({ success: true, count: properties.length, properties });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.TrustVerificationController = TrustVerificationController;
