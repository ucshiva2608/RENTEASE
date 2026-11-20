"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireConsent = exports.requireRole = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const prisma_1 = require("../config/prisma");
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ success: false, message: 'Access denied: No token provided' });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, config_1.config.jwtSecret);
        const user = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
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
exports.requireRole = requireRole;
const requireConsent = (req, res, next) => {
    if (req.user && !req.user.consentPersonalData) {
        res.status(403).json({
            success: false,
            message: 'Action blocked: User has withheld consent for personal data processing.',
        });
        return;
    }
    next();
};
exports.requireConsent = requireConsent;
