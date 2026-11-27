import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Module Routes
import authRoutes from './modules/auth/authRoutes';
import propertyRoutes from './modules/properties/propertyRoutes';
import trustRoutes from './modules/trust-verification/trustRoutes';
import aiMatchRoutes from './modules/ai-match/aiMatchRoutes';
import depositGuardRoutes from './modules/depositguard/depositGuardRoutes';
import aiCareRoutes from './modules/ai-care/aiCareRoutes';
import agreementRoutes from './modules/agreements/agreementRoutes';
import ownerCopilotRoutes from './modules/owner-copilot/ownerCopilotRoutes';
import neighborhoodRoutes from './modules/neighborhood/neighborhoodRoutes';
import voiceAssistantRoutes from './modules/voice-assistant/voiceAssistantRoutes';
import auditRoutes from './modules/audit/auditRoutes';

const app: Application = express();

// Middleware
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, health checks)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
      return callback(null, true); // Fallback allow to avoid cross-device lockouts
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.options('*', cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
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
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/trust', trustRoutes);
app.use('/api/ai-match', aiMatchRoutes);
app.use('/api/depositguard', depositGuardRoutes);
app.use('/api/ai-care', aiCareRoutes);
app.use('/api/agreements', agreementRoutes);
app.use('/api/owner-copilot', ownerCopilotRoutes);
app.use('/api/neighborhood', neighborhoodRoutes);
app.use('/api/voice-assistant', voiceAssistantRoutes);
app.use('/api/audit', auditRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.url}` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Global Error Handler:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;
