import request from 'supertest';
import app from '../app';
import { prisma } from '../config/prisma';
import { AIService } from '../services/aiService';
import { GeoService } from '../services/geoService';

describe('RentEase Advanced AI & Innovation Ecosystem Test Suite', () => {
  let adminToken: string;
  let ownerToken: string;
  let tenantToken: string;
  let samplePropertyId: string;
  let sampleDepositRecordId: string;

  beforeAll(async () => {
    // Authenticate as Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@rentease.com', password: 'RentEase@2026' });
    adminToken = adminRes.body.token;

    // Authenticate as Owner
    const ownerRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'venkat.rao@gmail.com', password: 'RentEase@2026' });
    ownerToken = ownerRes.body.token;

    // Authenticate as Tenant
    const tenantRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'rahul.varma@gmail.com', password: 'RentEase@2026' });
    tenantToken = tenantRes.body.token;

    // Retrieve a seeded property owned by owner1
    const propRes = await request(app).get('/api/properties');
    const owner1User = await prisma.user.findUnique({ where: { email: 'venkat.rao@gmail.com' } });
    const ownedProperty = propRes.body.properties.find((p: any) => p.ownerId === owner1User?.id);
    samplePropertyId = ownedProperty ? ownedProperty.id : propRes.body.properties[0].id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  // System Health
  test('GET /api/health should return HEALTHY with all 8 modules registered', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('HEALTHY');
    expect(res.body.modules).toHaveLength(8);
  });

  // MODULE 1: Trust and Verification
  describe('MODULE 1: Trust and Verification', () => {
    test('GET /api/trust/badge/:propertyId should return 5 transparent verification levels', async () => {
      const res = await request(app).get(`/api/trust/badge/${samplePropertyId}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.levels).toBeDefined();
      expect(res.body.levels.length).toBe(5);

      const levelTitles = res.body.levels.map((l: any) => l.title);
      expect(levelTitles).toContain('Identity Verified');
      expect(levelTitles).toContain('Ownership Documents Reviewed');
      expect(levelTitles).toContain('Location Verified');
      expect(levelTitles).toContain('Media Verified');
      expect(levelTitles).toContain('Listing Recently Confirmed');
    });

    test('Legal Safeguard: Identity verification confirms KYC only and contains disclaimer', async () => {
      const res = await request(app)
        .post('/api/auth/verify-identity')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ docType: 'AADHAAR', docNumber: '9988-7766-5544' });

      expect(res.status).toBe(200);
      expect(res.body.legalDisclaimer).toContain('does NOT independently confer or prove legal ownership');
    });

    test('POST /api/trust/admin/review allows Admin to review & approve property documents', async () => {
      const res = await request(app)
        .post('/api/trust/admin/review')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          propertyId: samplePropertyId,
          decision: 'APPROVE',
          reviewNotes: 'Verified sale deed from Telangana Registration Portal',
        });

      expect(res.status).toBe(200);
      expect(res.body.property.verificationStatus).toBe('VERIFIED');
      expect(res.body.property.badgeOwnershipDocsReviewed).toBe(true);
    });
  });

  // MODULE 2: RentEase AI Match
  describe('MODULE 2: RentEase AI Match', () => {
    test('Natural-language parser extracts budget, location, BHK, and amenities', () => {
      const parsed = AIService.parsePropertySearch('Find a furnished 2BHK in Hyderabad under ₹18,000 with parking');
      expect(parsed.city).toBe('Hyderabad');
      expect(parsed.bedrooms).toBe(2);
      expect(parsed.furnishing).toBe('FURNISHED');
      expect(parsed.maxBudget).toBe(18000);
      expect(parsed.amenitiesRequired).toContain('Parking');
    });

    test('POST /api/ai-match/search queries real PostgreSQL database and returns explainable matches', async () => {
      const res = await request(app)
        .post('/api/ai-match/search')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({ query: 'Find a furnished 2BHK in Hyderabad under ₹18,000 with parking' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.results.length).toBeGreaterThan(0);

      // Verify top match has match score and human-readable explanations
      const topMatch = res.body.results[0];
      expect(topMatch.matchScore).toBeGreaterThanOrEqual(70);
      expect(topMatch.explanations.length).toBeGreaterThan(0);
      expect(topMatch.property.city).toBe('Hyderabad');
    });
  });

  // MODULE 3: RentEase DepositGuard
  describe('MODULE 3: RentEase DepositGuard', () => {
    test('POST /api/depositguard/record initializes deposit ledger with escrow compliance disclaimer', async () => {
      const res = await request(app)
        .post('/api/depositguard/record')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          propertyId: samplePropertyId,
          tenantId: (await prisma.user.findFirst({ where: { role: 'TENANT' } }))!.id,
          originalDepositAmount: 35000,
          receiptReference: 'DEP-UNITTEST-001',
        });

      expect(res.status).toBe(201);
      sampleDepositRecordId = res.body.depositRecord.id;
      expect(res.body.depositRecord.originalDepositAmount).toBe(35000);
      expect(res.body.depositRecord.disclaimer).toContain('banking escrow partner');
    });

    test('POST /api/depositguard/inspection logs inspection with SHA-256 cryptographic photo hashes', async () => {
      const res = await request(app)
        .post('/api/depositguard/inspection')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          depositRecordId: sampleDepositRecordId,
          inspectionType: 'MOVE_IN',
          inspectorName: 'Verified Inspector',
          overallCondition: 'EXCELLENT',
          checklist: { walls: 'immaculate', fixtures: 'tested' },
          photos: ['https://images.unsplash.com/photo-1?auto=format'],
        });

      expect(res.status).toBe(201);
      const parsedPhotos = JSON.parse(res.body.report.photosJson);
      expect(parsedPhotos[0].sha256Hash).toBeDefined();
      expect(parsedPhotos[0].sha256Hash.length).toBe(64); // SHA-256 length
    });

    test('POST /api/depositguard/deduction calculates itemized deduction and recalculates refund', async () => {
      const res = await request(app)
        .post('/api/depositguard/deduction')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          depositRecordId: sampleDepositRecordId,
          category: 'PAINTING',
          description: 'Living room wall patch',
          claimedAmount: 2000,
          agreedAmount: 2000,
        });

      expect(res.status).toBe(201);
      expect(res.body.updatedRecord.totalDeductions).toBe(2000);
      expect(res.body.updatedRecord.calculatedRefundAmount).toBe(33000); // 35000 - 2000
    });

    test('POST /api/depositguard/dispute raises and tracks dispute', async () => {
      const res = await request(app)
        .post('/api/depositguard/dispute')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({
          depositRecordId: sampleDepositRecordId,
          action: 'RAISE',
          reason: 'Deduction for normal wear and tear contested',
        });

      expect(res.status).toBe(200);
      expect(res.body.depositRecord.disputeStatus).toBe('OPEN');
    });
  });

  // MODULE 4: RentEase AI Care
  describe('MODULE 4: RentEase AI Care', () => {
    let createdTicketId: string;

    test('AIService correctly classifies maintenance complaint and calculates SLA', () => {
      const result = AIService.classifyMaintenanceComplaint('Water pipe burst in kitchen, water flooding floor!');
      expect(result.category).toBe('PLUMBING');
      expect(result.urgency).toBe('EMERGENCY');
      expect(result.slaHours).toBe(4);
      expect(result.recommendedProvider).toBeDefined();
    });

    test('POST /api/ai-care/ticket creates ticket, sets SLA deadline, and matches verified vendor', async () => {
      const res = await request(app)
        .post('/api/ai-care/ticket')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({
          propertyId: samplePropertyId,
          title: 'AC Gas Leak and cooling loss',
          description: 'Split air conditioner stopped cooling and is humming loudly',
          complaintInputType: 'TEXT',
        });

      expect(res.status).toBe(201);
      expect(res.body.ticket.aiClassifiedCategory).toBe('HVAC');
      expect(res.body.ticket.slaHours).toBeDefined();
      expect(res.body.ticket.assignedVendorName).toBeDefined();
      createdTicketId = res.body.ticket.id;
    });

    test('POST /api/ai-care/quotation submits quote and owner authorizes final decision', async () => {
      // Step 1: Submit quote
      const quoteRes = await request(app)
        .post('/api/ai-care/quotation')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          ticketId: createdTicketId,
          quoteAmount: 1800,
          quoteDescription: 'Capacitor replacement and gas top-up',
        });
      expect(quoteRes.status).toBe(200);

      // Step 2: Owner approves quote
      const approveRes = await request(app)
        .post('/api/ai-care/quotation')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          ticketId: createdTicketId,
          approved: true,
        });
      expect(approveRes.status).toBe(200);
      expect(approveRes.body.ticket.quoteApprovedByOwner).toBe(true);
    });
  });

  // MODULE 5: RentEase Agreement Intelligence
  describe('MODULE 5: RentEase Agreement Intelligence', () => {
    test('POST /api/agreements/analyze extracts terms, flags missing clauses, and provides Telugu explanation', async () => {
      const sampleText = `This rental agreement executed on 1st Jan 2026. Monthly rent of ₹18,000. Security deposit is ₹50,000. Minimum lock-in 6 months. Annual escalation 5%.`;

      const res = await request(app)
        .post('/api/agreements/analyze')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ agreementText: sampleText });

      expect(res.status).toBe(200);
      expect(res.body.analysis.monthlyRent).toBe(18000);
      expect(res.body.analysis.securityDeposit).toBe(50000);
      expect(res.body.analysis.summaryTe).toContain('ఈ అద్దె ఒప్పందం ప్రకారం');
      expect(res.body.analysis.missingInformationAlerts).toBeDefined();
      expect(res.body.disclaimer).toContain('informational review only');
    });

    test('GET /api/agreements/renewal-alerts returns active leases approaching expiry with notice reminders', async () => {
      const res = await request(app)
        .get('/api/agreements/renewal-alerts?days=90')
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.alerts).toBeDefined();
    });
  });

  // MODULE 6: RentEase Owner Copilot
  describe('MODULE 6: RentEase Owner Copilot', () => {
    test('POST /api/owner-copilot/query securely answers "Show my vacant properties"', async () => {
      const res = await request(app)
        .post('/api/owner-copilot/query')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ message: 'Show my vacant properties' });

      expect(res.status).toBe(200);
      expect(res.body.toolInvoked).toBe('get_vacant_properties');
      expect(res.body.reply).toBeDefined();
    });

    test('POST /api/owner-copilot/query securely answers "How much rent did I collect this month?"', async () => {
      const res = await request(app)
        .post('/api/owner-copilot/query')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ message: 'How much rent did I collect this month?' });

      expect(res.status).toBe(200);
      expect(res.body.toolInvoked).toBe('get_monthly_revenue');
      expect(res.body.reply).toContain('collected');
    });

    test('Tenant is blocked from calling Owner Copilot (Role-Based Access Control)', async () => {
      const res = await request(app)
        .post('/api/owner-copilot/query')
        .set('Authorization', `Bearer ${tenantToken}`)
        .send({ message: 'Show my vacant properties' });

      expect(res.status).toBe(403);
    });
  });

  // MODULE 7: RentEase Neighborhood Intelligence
  describe('MODULE 7: RentEase Neighborhood Intelligence', () => {
    test('GET /api/neighborhood/:propertyId returns verified nearby hospitals, schools, transit, and livability radar', async () => {
      const res = await request(app).get(`/api/neighborhood/${samplePropertyId}`);
      expect(res.status).toBe(200);
      expect(res.body.neighborhood).toBeDefined();
      expect(res.body.neighborhood.transitScore).toBeGreaterThanOrEqual(0);
      expect(res.body.neighborhood.overallLivability).toBeGreaterThanOrEqual(0);

      const categories = res.body.neighborhood.amenities.map((a: any) => a.category);
      expect(categories).toContain('HOSPITAL');
      expect(categories).toContain('SCHOOL');
      expect(categories).toContain('TRANSIT');
      expect(categories).toContain('SHOPPING');
      expect(categories).toContain('RESTAURANT');
    });

    test('GeoService calculates real Haversine distance and commute times', () => {
      const dist = GeoService.calculateHaversineDistance(17.4435, 78.3653, 17.4168, 78.4485);
      expect(dist).toBeGreaterThan(5);
      expect(dist).toBeLessThan(15);
    });
  });

  // MODULE 8: Multilingual Voice Assistant
  describe('MODULE 8: Multilingual Voice Assistant', () => {
    test('Processes Telugu voice transcript and returns Telugu response', async () => {
      const res = await request(app)
        .post('/api/voice-assistant/query')
        .send({ transcript: 'హైదరాబాద్‌లో 2BHK ఇల్లు కావాలి', language: 'te' });

      expect(res.status).toBe(200);
      expect(res.body.result.intent).toBe('SEARCH_PROPERTIES');
      expect(res.body.result.spokenResponse).toContain('హైదరాబాద్‌లో');
    });

    test('Processes Hindi voice transcript and returns Hindi response', async () => {
      const res = await request(app)
        .post('/api/voice-assistant/query')
        .send({ transcript: 'मुझे हैदराबाद में 2BHK फ्लैट चाहिए', language: 'hi' });

      expect(res.status).toBe(200);
      expect(res.body.result.intent).toBe('SEARCH_PROPERTIES');
      expect(res.body.result.spokenResponse).toContain('हैदराबाद में');
    });

    test('Processes English voice transcript for Owner Copilot shortcut', async () => {
      const res = await request(app)
        .post('/api/voice-assistant/query')
        .send({ transcript: 'Show my vacant properties', language: 'en' });

      expect(res.status).toBe(200);
      expect(res.body.result.action).toBe('OPEN_OWNER_COPILOT');
    });
  });

  // Audit Logging
  describe('Audit Logging Verification', () => {
    test('GET /api/audit returns structured immutable system audit trail', async () => {
      const res = await request(app)
        .get('/api/audit')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.logs.length).toBeGreaterThan(0);
      expect(res.body.logs[0].action).toBeDefined();
      expect(res.body.logs[0].entityType).toBeDefined();
    });
  });
});
