import { Request, Response } from 'express';
import { prisma } from '../../config/prisma';
import { GeoService } from '../../services/geoService';

export class NeighborhoodController {
  public static async getNeighborhoodInfo(req: Request, res: Response): Promise<void> {
    try {
      const { propertyId } = req.params;

      const property = await prisma.property.findUnique({
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

      const neighborhood = GeoService.getNearbyAmenities(
        property.latitude,
        property.longitude,
        property.city
      );

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
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
