import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { prisma } from '../config/prisma';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
  consentPersonalData: boolean;
  consentAuditLogging: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Access denied: No token provided' });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; role: string; email: string };
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        consentPersonalData: true,
        consentAuditLogging: true,
        aiQueryQuotaRemaining: true,
      },
    });

    if (!user) {
      res.status(401).json({ success: false, message: 'User not found or session invalid' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${allowedRoles.join(', ')}] role`,
      });
      return;
    }

    next();
  };
};

export const requireConsent = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user && !req.user.consentPersonalData) {
    res.status(403).json({
      success: false,
      message: 'Action blocked: User has withheld consent for personal data processing.',
    });
    return;
  }
  next();
};
