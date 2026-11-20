"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAIRateLimit = void 0;
const prisma_1 = require("../config/prisma");
const checkAIRateLimit = async (req, res, next) => {
    if (!req.user) {
        // If unauthenticated public AI search, let it pass or apply IP rate limiter
        next();
        return;
    }
    try {
        const user = await prisma_1.prisma.user.findUnique({
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
        await prisma_1.prisma.user.update({
            where: { id: req.user.id },
            data: { aiQueryQuotaRemaining: { decrement: 1 } },
        });
        next();
    }
    catch (error) {
        console.error('Rate limit check error:', error);
        next();
    }
};
exports.checkAIRateLimit = checkAIRateLimit;
