import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { config } from '../../config';
import { AuditService } from '../../services/auditService';
import { AuthenticatedRequest } from '../../middleware/auth';

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    try {
      const { name, email, password, phone, role, consentPersonalData, consentAuditLogging } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ success: false, message: 'Name, email, and password are required' });
        return;
      }

      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(409).json({ success: false, message: 'Email already registered' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone: phone || null,
          role: role || 'TENANT',
          consentPersonalData: consentPersonalData !== undefined ? consentPersonalData : true,
          consentAuditLogging: consentAuditLogging !== undefined ? consentAuditLogging : true,
          aiQueryQuotaRemaining: config.aiRateLimitDefault,
        },
      });

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      await AuditService.log({
        userId: user.id,
        action: 'USER_REGISTERED',
        entityType: 'User',
        entityId: user.id,
        details: { role: user.role, consentPersonalData: user.consentPersonalData },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isIdentityVerified: user.isIdentityVerified,
          aiQueryQuotaRemaining: user.aiQueryQuotaRemaining,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Email and password are required' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password' });
        return;
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      await AuditService.log({
        userId: user.id,
        action: 'USER_LOGIN',
        entityType: 'User',
        entityId: user.id,
        details: { email: user.email },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          isIdentityVerified: user.isIdentityVerified,
          identityDocType: user.identityDocType,
          consentPersonalData: user.consentPersonalData,
          aiQueryQuotaRemaining: user.aiQueryQuotaRemaining,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          isIdentityVerified: true,
          identityDocType: true,
          identityDocNumberMasked: true,
          identityVerifiedAt: true,
          consentPersonalData: true,
          consentAuditLogging: true,
          aiQueryQuotaRemaining: true,
          createdAt: true,
        },
      });

      res.json({ success: true, user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async updateConsent(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { consentPersonalData, consentAuditLogging } = req.body;

      const updated = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          consentPersonalData: consentPersonalData !== undefined ? consentPersonalData : undefined,
          consentAuditLogging: consentAuditLogging !== undefined ? consentAuditLogging : undefined,
        },
      });

      await AuditService.log({
        userId: req.user.id,
        action: 'CONSENT_UPDATED',
        entityType: 'User',
        entityId: req.user.id,
        details: { consentPersonalData, consentAuditLogging },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Privacy and consent preferences saved.',
        user: {
          id: updated.id,
          consentPersonalData: updated.consentPersonalData,
          consentAuditLogging: updated.consentAuditLogging,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  public static async verifyIdentity(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { docType, docNumber } = req.body;
      if (!docType || !docNumber) {
        res.status(400).json({ success: false, message: 'Document type and number required' });
        return;
      }

      // Mask document number for DPDP/GDPR compliance
      const cleanNum = docNumber.toString().replace(/[\s-]/g, '');
      const masked = cleanNum.length > 4 ? `XXXX-XXXX-${cleanNum.slice(-4)}` : `XXXX-${cleanNum}`;

      const updatedUser = await prisma.user.update({
        where: { id: req.user.id },
        data: {
          isIdentityVerified: true,
          identityDocType: docType.toUpperCase(),
          identityDocNumberMasked: masked,
          identityVerifiedAt: new Date(),
        },
      });

      // Also update badges on properties owned by this user
      await prisma.property.updateMany({
        where: { ownerId: req.user.id },
        data: { badgeIdentityVerified: true },
      });

      await AuditService.log({
        userId: req.user.id,
        action: 'IDENTITY_VERIFIED',
        entityType: 'User',
        entityId: req.user.id,
        details: {
          docType,
          maskedNumber: masked,
          disclaimer: 'Identity verification validates KYC only; it does NOT constitute proof of property ownership.',
        },
        ipAddress: req.ip,
      });

      res.json({
        success: true,
        message: 'Owner identity successfully verified.',
        legalDisclaimer:
          'IMPORTANT: Identity verification authenticates individual KYC credentials. It does NOT independently confer or prove legal ownership of any real estate.',
        user: {
          id: updatedUser.id,
          isIdentityVerified: updatedUser.isIdentityVerified,
          identityDocType: updatedUser.identityDocType,
          identityDocNumberMasked: updatedUser.identityDocNumberMasked,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}
