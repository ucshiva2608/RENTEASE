"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyController = void 0;
const crypto_1 = __importDefault(require("crypto"));
const prisma_1 = require("../../config/prisma");
const auditService_1 = require("../../services/auditService");
class PropertyController {
    static async getAllProperties(req, res) {
        try {
            const { city, minRent, maxRent, bedrooms, furnishing, propertyType, verifiedOnly, search, } = req.query;
            const where = { isAvailable: true };
            if (city) {
                where.city = { contains: String(city) };
            }
            if (bedrooms) {
                where.bedrooms = parseInt(String(bedrooms), 10);
            }
            if (furnishing) {
                where.furnishing = String(furnishing);
            }
            if (propertyType) {
                where.propertyType = String(propertyType);
            }
            if (minRent || maxRent) {
                where.monthlyRent = {};
                if (minRent)
                    where.monthlyRent.gte = parseFloat(String(minRent));
                if (maxRent)
                    where.monthlyRent.lte = parseFloat(String(maxRent));
            }
            if (verifiedOnly === 'true') {
                where.verificationStatus = 'VERIFIED';
            }
            if (search) {
                const queryStr = String(search).toLowerCase();
                where.OR = [
                    { title: { contains: queryStr } },
                    { address: { contains: queryStr } },
                    { description: { contains: queryStr } },
                ];
            }
            const properties = await prisma_1.prisma.property.findMany({
                where,
                include: {
                    owner: {
                        select: { id: true, name: true, isIdentityVerified: true, phone: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            });
            res.json({ success: true, count: properties.length, properties });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async getPropertyById(req, res) {
        try {
            const { id } = req.params;
            const property = await prisma_1.prisma.property.findUnique({
                where: { id },
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            isIdentityVerified: true,
                            identityDocType: true,
                        },
                    },
                },
            });
            if (!property) {
                res.status(404).json({ success: false, message: 'Property not found' });
                return;
            }
            res.json({ success: true, property });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async createProperty(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ success: false, message: 'Unauthorized' });
                return;
            }
            const { title, description, address, city, state, pincode, latitude, longitude, monthlyRent, securityDeposit, bedrooms, bathrooms, furnishing, propertyType, amenities, squareFeet, images, videoUrl, } = req.body;
            if (!title || !address || !city || !monthlyRent) {
                res.status(400).json({ success: false, message: 'Title, address, city, and rent are required' });
                return;
            }
            const imagesArray = Array.isArray(images) ? images : [images || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80'];
            const imagesJson = JSON.stringify(imagesArray);
            // Duplicate listing detection via address normalization & image hash
            const normalizedAddress = address.trim().toLowerCase().replace(/[^\w\s]/gi, '');
            const imageHash = crypto_1.default.createHash('sha256').update(imagesArray[0] || '').digest('hex').slice(0, 16);
            const existingDuplicate = await prisma_1.prisma.property.findFirst({
                where: {
                    OR: [
                        { imageHash },
                        {
                            city: { contains: city },
                            pincode: pincode ? { contains: pincode } : undefined,
                            monthlyRent: { gte: parseFloat(monthlyRent) * 0.95, lte: parseFloat(monthlyRent) * 1.05 },
                        },
                    ],
                },
            });
            const duplicateDetected = !!existingDuplicate;
            const duplicateRefId = existingDuplicate ? existingDuplicate.id : null;
            // Check owner KYC status for initial trust badge
            const owner = await prisma_1.prisma.user.findUnique({ where: { id: req.user.id } });
            const badgeIdentityVerified = owner ? owner.isIdentityVerified : false;
            const property = await prisma_1.prisma.property.create({
                data: {
                    title,
                    description: description || '',
                    address,
                    city,
                    state: state || 'Telangana',
                    pincode: pincode || '500081',
                    latitude: latitude ? parseFloat(latitude) : 17.4435,
                    longitude: longitude ? parseFloat(longitude) : 78.3653,
                    monthlyRent: parseFloat(monthlyRent),
                    securityDeposit: securityDeposit ? parseFloat(securityDeposit) : parseFloat(monthlyRent) * 2,
                    bedrooms: bedrooms ? parseInt(bedrooms, 10) : 2,
                    bathrooms: bathrooms ? parseInt(bathrooms, 10) : 2,
                    furnishing: furnishing || 'SEMI_FURNISHED',
                    propertyType: propertyType || 'APARTMENT',
                    amenities: Array.isArray(amenities) ? JSON.stringify(amenities) : typeof amenities === 'string' ? amenities : '["Parking","Security"]',
                    squareFeet: squareFeet ? parseInt(squareFeet, 10) : 1200,
                    images: imagesJson,
                    videoUrl: videoUrl || null,
                    imageHash,
                    ownerId: req.user.id,
                    duplicateListingDetected: duplicateDetected,
                    duplicateListingReferenceId: duplicateRefId,
                    badgeIdentityVerified,
                    badgeRecentlyConfirmed: true,
                    listingConfirmedAt: new Date(),
                },
            });
            await auditService_1.AuditService.log({
                userId: req.user.id,
                action: 'PROPERTY_CREATED',
                entityType: 'Property',
                entityId: property.id,
                details: {
                    title: property.title,
                    monthlyRent: property.monthlyRent,
                    duplicateDetected,
                },
                ipAddress: req.ip,
            });
            res.status(201).json({
                success: true,
                message: 'Property listed successfully.',
                property,
                duplicateWarning: duplicateDetected
                    ? 'Notice: Potential duplicate listing similarity flagged for admin verification.'
                    : null,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async updateProperty(req, res) {
        try {
            const { id } = req.params;
            const existing = await prisma_1.prisma.property.findUnique({ where: { id } });
            if (!existing) {
                res.status(404).json({ success: false, message: 'Property not found' });
                return;
            }
            if (req.user?.role !== 'ADMIN' && existing.ownerId !== req.user?.id) {
                res.status(403).json({ success: false, message: 'Forbidden: You do not own this property' });
                return;
            }
            const updated = await prisma_1.prisma.property.update({
                where: { id },
                data: {
                    ...req.body,
                    monthlyRent: req.body.monthlyRent ? parseFloat(req.body.monthlyRent) : undefined,
                    securityDeposit: req.body.securityDeposit ? parseFloat(req.body.securityDeposit) : undefined,
                    amenities: Array.isArray(req.body.amenities) ? JSON.stringify(req.body.amenities) : req.body.amenities,
                    images: Array.isArray(req.body.images) ? JSON.stringify(req.body.images) : req.body.images,
                    listingConfirmedAt: new Date(),
                },
            });
            await auditService_1.AuditService.log({
                userId: req.user?.id,
                action: 'PROPERTY_UPDATED',
                entityType: 'Property',
                entityId: id,
                details: { fieldsUpdated: Object.keys(req.body) },
                ipAddress: req.ip,
            });
            res.json({ success: true, message: 'Property updated', property: updated });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.PropertyController = PropertyController;
