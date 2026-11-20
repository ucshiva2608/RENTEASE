import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AIService } from '../../services/aiService';
import { AuthenticatedRequest } from '../../middleware/auth';
import { AuditService } from '../../services/auditService';

export class AIMatchController {
  public static async searchProperties(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        res.status(400).json({ success: false, message: 'Natural-language query string is required' });
        return;
      }

      // Step 1: Parse natural-language query using AI NLU parser
      const parsed = AIService.parsePropertySearch(query);

      // Step 2: Query real PostgreSQL/SQLite database with broad or flexible criteria
      const where: any = { isAvailable: true };

      if (parsed.city) {
        where.city = { contains: parsed.city };
      }

      // Retrieve candidate properties
      let candidates = await prisma.property.findMany({
        where,
        include: {
          owner: {
            select: { id: true, name: true, isIdentityVerified: true },
          },
        },
      });

      // If strict city filter returned no results, expand search across all available properties
      if (candidates.length === 0) {
        candidates = await prisma.property.findMany({
          where: { isAvailable: true },
          include: {
            owner: {
              select: { id: true, name: true, isIdentityVerified: true },
            },
          },
        });
      }

      // Step 3: Compute explainable AI match scores for every candidate
      const rankedProperties = candidates
        .map(property => {
          const matchResult = AIService.calculateMatchScore(property, parsed);
          return {
            property,
            matchScore: matchResult.score,
            explanations: matchResult.explanations,
          };
        })
        .sort((a, b) => b.matchScore - a.matchScore);

      // Step 4: Audit logging
      await AuditService.log({
        userId: req.user?.id,
        action: 'AI_PROPERTY_SEARCH',
        entityType: 'Property',
        details: {
          rawQuery: query,
          parsed,
          resultsCount: rankedProperties.length,
          topMatchScore: rankedProperties[0]?.matchScore || 0,
        },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        query,
        parsedCriteria: parsed,
        totalMatches: rankedProperties.length,
        results: rankedProperties,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
