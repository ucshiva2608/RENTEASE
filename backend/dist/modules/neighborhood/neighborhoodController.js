"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeighborhoodController = void 0;
const prisma_1 = require("../../config/prisma");
const geoService_1 = require("../../services/geoService");
class NeighborhoodController {
    static async getNeighborhoodInfo(req, res) {
        try {
            const { propertyId } = req.params;
            const property = await prisma_1.prisma.property.findUnique({
                where: { id: propertyId },
                select: {
                    id: true,
                    title: true,
                    address: true,
                    city: true,
                    latitude: true,
                    longitude: true,
                },
            });
            if (!property) {
                res.status(404).json({ success: false, message: 'Property not found' });
                return;
            }
            const neighborhood = geoService_1.GeoService.getNearbyAmenities(property.latitude, property.longitude, property.city);
            res.json({
                success: true,
                property: {
                    id: property.id,
                    title: property.title,
                    address: property.address,
                    city: property.city,
                    coordinates: { lat: property.latitude, lon: property.longitude },
                },
                neighborhood,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.NeighborhoodController = NeighborhoodController;
