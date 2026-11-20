"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Module Routes
const authRoutes_1 = __importDefault(require("./modules/auth/authRoutes"));
const propertyRoutes_1 = __importDefault(require("./modules/properties/propertyRoutes"));
const trustRoutes_1 = __importDefault(require("./modules/trust-verification/trustRoutes"));
const aiMatchRoutes_1 = __importDefault(require("./modules/ai-match/aiMatchRoutes"));
const depositGuardRoutes_1 = __importDefault(require("./modules/depositguard/depositGuardRoutes"));
const aiCareRoutes_1 = __importDefault(require("./modules/ai-care/aiCareRoutes"));
const agreementRoutes_1 = __importDefault(require("./modules/agreements/agreementRoutes"));
const ownerCopilotRoutes_1 = __importDefault(require("./modules/owner-copilot/ownerCopilotRoutes"));
const neighborhoodRoutes_1 = __importDefault(require("./modules/neighborhood/neighborhoodRoutes"));
const voiceAssistantRoutes_1 = __importDefault(require("./modules/voice-assistant/voiceAssistantRoutes"));
const auditRoutes_1 = __importDefault(require("./modules/audit/auditRoutes"));
const app = (0, express_1.default)();
// Middleware
app.use((0, cors_1.default)({ origin: true, credentials: true }));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'HEALTHY',
        system: 'RentEase Advanced AI & Innovation Ecosystem',
        version: '2.0.0',
        modules: [
            'MODULE 1: Trust & Verification',
            'MODULE 2: AI Match (Natural Language & Explainable Recommendations)',
            'MODULE 3: DepositGuard (Audit Trails, Inspections, Deductions, Disputes)',
            'MODULE 4: AI Care (Maintenance Classification, SLA, Vendor Matching)',
            'MODULE 5: Agreement Intelligence (Clauses, Multilingual Telugu/English, Discrepancies)',
            'MODULE 6: Owner Copilot (Authorized Tool Calling & Portfolio Insights)',
            'MODULE 7: Neighborhood Intelligence (Nearby Amenities & Livability Radar)',
            'MODULE 8: Multilingual Voice Assistant (English, Telugu, Hindi)',
        ],
        timestamp: new Date().toISOString(),
    });
});
// Mount Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/properties', propertyRoutes_1.default);
app.use('/api/trust', trustRoutes_1.default);
app.use('/api/ai-match', aiMatchRoutes_1.default);
app.use('/api/depositguard', depositGuardRoutes_1.default);
app.use('/api/ai-care', aiCareRoutes_1.default);
app.use('/api/agreements', agreementRoutes_1.default);
app.use('/api/owner-copilot', ownerCopilotRoutes_1.default);
app.use('/api/neighborhood', neighborhoodRoutes_1.default);
app.use('/api/voice-assistant', voiceAssistantRoutes_1.default);
app.use('/api/audit', auditRoutes_1.default);
// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});
// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
});
exports.default = app;
