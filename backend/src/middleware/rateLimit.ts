import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { prisma } from '../config/prisma';

export const checkAIRateLimit = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    // If unauthenticated public AI search, let it pass or apply IP rate limiter
    next();
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { aiQueryQuotaRemaining: true },
    });

    if (!user || user.aiQueryQuotaRemaining <= 0) {
      res.status(429).json({
        success: false,
        message: 'AI query limit reached. Please contact RentEase administrator for quota reset.',
      });
      return;
    }

    // Decrement quota by 1
    await prisma.user.update({
      where: { id: req.user.id },
      data: { aiQueryQuotaRemaining: { decrement: 1 } },
    });

    next();
  } catch (error) {
    console.error('Rate limit check error:', error);
    next();
  }
};
