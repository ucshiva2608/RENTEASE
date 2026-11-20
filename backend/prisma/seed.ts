import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding RentEase database with comprehensive realistic ecosystem data...');

  // Clean existing records
  await prisma.auditLog.deleteMany();
  await prisma.rentPayment.deleteMany();
  await prisma.rentalAgreement.deleteMany();
  await prisma.tenantApplication.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.depositDeductionItem.deleteMany();
  await prisma.inspectionReport.deleteMany();
  await prisma.depositRecord.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('RentEase@2026', 10);

  // 1. Seed Users (Admin, Owners, Tenants)
  const admin = await prisma.user.create({
    data: {
      name: 'Priya Sharma (Admin)',
      email: 'admin@rentease.com',
      password: passwordHash,
      role: 'ADMIN',
      phone: '+91 98480 11111',
      isIdentityVerified: true,
      identityDocType: 'PASSPORT',
      identityDocNumberMasked: 'XXXX-XXXX-9901',
      identityVerifiedAt: new Date(),
      consentPersonalData: true,
      consentAuditLogging: true,
      aiQueryQuotaRemaining: 1000,
    },
  });

  const owner1 = await prisma.user.create({
    data: {
      name: 'Venkat Rao',
      email: 'venkat.rao@gmail.com',
      password: passwordHash,
      role: 'OWNER',
      phone: '+91 98490 12345',
      isIdentityVerified: true,
      identityDocType: 'AADHAAR',
      identityDocNumberMasked: 'XXXX-XXXX-4892',
      identityVerifiedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
      consentPersonalData: true,
      consentAuditLogging: true,
      aiQueryQuotaRemaining: 250,
    },
  });

  const owner2 = await prisma.user.create({
    data: {
      name: 'Ananya Reddy',
      email: 'ananya.reddy@gmail.com',
      password: passwordHash,
      role: 'OWNER',
      phone: '+91 98490 67890',
      isIdentityVerified: true,
      identityDocType: 'PASSPORT',
      identityDocNumberMasked: 'XXXX-XXXX-8120',
      identityVerifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      consentPersonalData: true,
      consentAuditLogging: true,
      aiQueryQuotaRemaining: 200,
    },
  });

  const tenant1 = await prisma.user.create({
    data: {
      name: 'Rahul Varma',
      email: 'rahul.varma@gmail.com',
      password: passwordHash,
      role: 'TENANT',
      phone: '+91 91000 55555',
      isIdentityVerified: true,
      identityDocType: 'AADHAAR',
      identityDocNumberMasked: 'XXXX-XXXX-7721',
      identityVerifiedAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      consentPersonalData: true,
      consentAuditLogging: true,
      aiQueryQuotaRemaining: 150,
    },
  });

  const tenant2 = await prisma.user.create({
    data: {
      name: 'Sneha Patel',
      email: 'sneha.patel@gmail.com',
      password: passwordHash,
      role: 'TENANT',
      phone: '+91 91000 66666',
      isIdentityVerified: true,
      identityDocType: 'VOTER_ID',
      identityDocNumberMasked: 'XXXX-XXXX-3349',
      identityVerifiedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000),
      consentPersonalData: true,
      consentAuditLogging: true,
      aiQueryQuotaRemaining: 150,
    },
  });

  // 2. Seed Real Verified Properties in Hyderabad & Bengaluru
  // Property 1: The exact prompt example match! Furnished 2BHK in Hyderabad under ₹18,000 with parking
  const prop1 = await prisma.property.create({
    data: {
      title: 'Serene Heights 2BHK Luxury Living',
      description: 'Well-maintained, fully furnished 2BHK apartment in Gachibowli IT corridor with covered parking, 24/7 power backup, high-speed lift, and modular kitchen.',
      address: 'Plot 42, Telecom Nagar, Gachibowli',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500032',
      latitude: 17.4435,
      longitude: 78.3653,
      monthlyRent: 16500,
      securityDeposit: 35000,
      bedrooms: 2,
      bathrooms: 2,
      furnishing: 'FURNISHED',
      propertyType: 'APARTMENT',
      amenities: JSON.stringify(['Parking', 'Power Backup', 'Gym', 'Elevator', 'Security', 'Balcony']),
      squareFeet: 1150,
      isAvailable: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1000&q=80',
      ]),
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      imageHash: 'a9f24c8b1d3e709a',
      ownerId: owner1.id,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      verificationExpiry: new Date(Date.now() + 350 * 24 * 60 * 60 * 1000),
      adminReviewNotes: 'Ownership deed verified via Telangana Dharani Portal. Coordinates consistent with physical plot.',
      badgeIdentityVerified: true,
      badgeOwnershipDocsReviewed: true,
      badgeLocationVerified: true,
      badgeMediaVerified: true,
      badgeRecentlyConfirmed: true,
      ownershipDocType: 'SALE_DEED',
      ownershipDocUrl: 'https://docs.rentease.internal/deeds/gachibowli-plot42-deed.pdf',
      listingConfirmedAt: new Date(),
    },
  });

  // Property 2: Banjara Hills 3BHK Premium
  const prop2 = await prisma.property.create({
    data: {
      title: 'Banjara Hills Royal Crest Residence',
      description: 'Expansive 3BHK semi-furnished luxury flat with panoramic city views, private balcony, marble flooring, and 2 dedicated parking bays.',
      address: 'Road No. 12, Banjara Hills',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      latitude: 17.4168,
      longitude: 78.4485,
      monthlyRent: 38000,
      securityDeposit: 80000,
      bedrooms: 3,
      bathrooms: 3,
      furnishing: 'SEMI_FURNISHED',
      propertyType: 'APARTMENT',
      amenities: JSON.stringify(['Parking', 'Power Backup', 'Gym', 'Swimming Pool', 'Security', 'Clubhouse']),
      squareFeet: 2100,
      isAvailable: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1000&q=80',
      ]),
      imageHash: 'c4e78a109bf25e31',
      ownerId: owner2.id,
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      verificationExpiry: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
      badgeIdentityVerified: true,
      badgeOwnershipDocsReviewed: true,
      badgeLocationVerified: true,
      badgeMediaVerified: true,
      badgeRecentlyConfirmed: true,
      ownershipDocType: 'PROPERTY_TAX_RECEIPT',
      ownershipDocUrl: 'https://docs.rentease.internal/deeds/banjara-hills-tax2026.pdf',
      listingConfirmedAt: new Date(),
    },
  });

  // Property 3: Madhapur 1BHK Studio for Young IT Tech Professionals
  const prop3 = await prisma.property.create({
    data: {
      title: 'CyberView Studio 1BHK Madhapur',
      description: 'Chic 1BHK furnished modern studio 500m from Durgam Cheruvu Metro. Includes high-speed fiber internet wiring, air conditioner, and parking.',
      address: 'Near Durgam Cheruvu, Madhapur',
      city: 'Hyderabad',
      state: 'Telangana',
      pincode: '500081',
      latitude: 17.4398,
      longitude: 78.3848,
      monthlyRent: 14000,
      securityDeposit: 28000,
      bedrooms: 1,
      bathrooms: 1,
      furnishing: 'FURNISHED',
      propertyType: 'STUDIO',
      amenities: JSON.stringify(['Parking', 'Power Backup', 'Elevator', 'Security']),
      squareFeet: 650,
      isAvailable: false, // Currently leased to tenant1
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&w=1000&q=80',
      ]),
      imageHash: 'f8b192e45da70c32',
      ownerId: owner1.id,
      verificationStatus: 'VERIFIED',
      badgeIdentityVerified: true,
      badgeOwnershipDocsReviewed: true,
      badgeLocationVerified: true,
      badgeMediaVerified: true,
      badgeRecentlyConfirmed: true,
      ownershipDocType: 'SALE_DEED',
      listingConfirmedAt: new Date(),
    },
  });

  // Property 4: Bengaluru Indiranagar 2BHK
  const prop4 = await prisma.property.create({
    data: {
      title: 'Indiranagar Prime Green 2BHK',
      description: 'Spacious 2BHK flat situated 300 meters from 100 Feet Road cafes and Indiranagar Metro.',
      address: '12th Main Road, HAL 2nd Stage, Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560038',
      latitude: 12.9784,
      longitude: 77.6408,
      monthlyRent: 32000,
      securityDeposit: 100000,
      bedrooms: 2,
      bathrooms: 2,
      furnishing: 'SEMI_FURNISHED',
      propertyType: 'APARTMENT',
      amenities: JSON.stringify(['Parking', 'Power Backup', 'Security', 'Balcony']),
      squareFeet: 1250,
      isAvailable: true,
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80',
      ]),
      imageHash: 'd7a45610bc8921e4',
      ownerId: owner2.id,
      verificationStatus: 'VERIFIED',
      badgeIdentityVerified: true,
      badgeOwnershipDocsReviewed: true,
      badgeLocationVerified: true,
      badgeMediaVerified: true,
      badgeRecentlyConfirmed: true,
      ownershipDocType: 'SALE_DEED',
      listingConfirmedAt: new Date(),
    },
  });

  // 3. Seed Rental Agreement (Module 5)
  const agreement1 = await prisma.rentalAgreement.create({
    data: {
      propertyId: prop3.id,
      ownerId: owner1.id,
      tenantId: tenant1.id,
      startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // Expiring in 45 days! Proactive reminder trigger!
      monthlyRent: 14000,
      securityDeposit: 28000,
      lockInPeriodMonths: 6,
      noticePeriodDays: 30,
      escalationPercent: 5.0,
      stateJurisdiction: 'Telangana',
      status: 'ACTIVE',
      aiSummaryEn: '11-month registered lease at CyberView Studio. Monthly rent ₹14,000, deposit ₹28,000. 30-day notice window active.',
      aiSummaryTe: 'ఈ అద్దె ఒప్పందం ప్రకారం నెలకు అద్దె ₹14,000 మరియు సెక్యూరిటీ డిపాజిట్ ₹28,000. ఒప్పందం ముగిసేందుకు 30 రోజుల నోటీస్ అవసరం.',
      missingInformationAlerts: JSON.stringify(['Notice window active: Tenant and owner must confirm renewal within 15 days.']),
    },
  });

  // Seed Rent Payments
  await prisma.rentPayment.create({
    data: {
      agreementId: agreement1.id,
      amount: 14000,
      dueDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      paidDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000),
      status: 'PAID',
      receiptNumber: 'REC-2026-10-092',
      paymentMethod: 'UPI',
    },
  });

  await prisma.rentPayment.create({
    data: {
      agreementId: agreement1.id,
      amount: 14000,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'OVERDUE',
      receiptNumber: 'REC-2026-11-041',
      paymentMethod: 'UPI',
    },
  });

  // 4. Seed DepositGuard Record (Module 3)
  const depositRecord1 = await prisma.depositRecord.create({
    data: {
      propertyId: prop3.id,
      tenantId: tenant1.id,
      ownerId: owner1.id,
      originalDepositAmount: 28000,
      depositPaidDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
      receiptReference: 'DEP-ESCROW-2026-8841',
      escrowStatus: 'HELD_IN_ESCROW_ACCOUNT',
      totalDeductions: 3500,
      calculatedRefundAmount: 24500,
      ownerSigned: true,
      ownerSignedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      tenantSigned: false, // Tenant is reviewing deduction items
      disputeRaised: false,
      refundStatus: 'PENDING',
    },
  });

  // Move-in Inspection with cryptographic SHA-256 photo hashes
  const moveInPhotoHash1 = crypto.createHash('sha256').update('https://images.unsplash.com/photo-1584622650111-993a426fbf0a' + 'movein').digest('hex');
  const moveInPhotoHash2 = crypto.createHash('sha256').update('https://images.unsplash.com/photo-1560448204-e02f11c3d0e2' + 'movein').digest('hex');

  await prisma.inspectionReport.create({
    data: {
      depositRecordId: depositRecord1.id,
      inspectionType: 'MOVE_IN',
      inspectorName: 'Suresh Kumar (Certified Inspector)',
      overallCondition: 'EXCELLENT',
      checklistJson: JSON.stringify({
        walls: 'Freshly painted, no dampness or scratches',
        flooring: 'Vitrified tiles pristine',
        plumbing: 'All faucets and shower operational with zero leakage',
        electrical: 'All switches, sockets, and geyser working',
      }),
      photosJson: JSON.stringify([
        {
          url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
          caption: 'Living room walls and floor condition upon handover',
          timestamp: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          sha256Hash: moveInPhotoHash1,
        },
        {
          url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80',
          caption: 'Bathroom sanitary fittings and geyser operational',
          timestamp: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
          sha256Hash: moveInPhotoHash2,
        },
      ]),
      tenantAgreed: true,
      ownerAgreed: true,
    },
  });

  // Move-out Inspection Report
  await prisma.inspectionReport.create({
    data: {
      depositRecordId: depositRecord1.id,
      inspectionType: 'MOVE_OUT',
      inspectorName: 'Suresh Kumar (Certified Inspector)',
      overallCondition: 'GOOD',
      checklistJson: JSON.stringify({
        walls: 'Minor wall scuffs in hall; kitchen faucet loose',
        flooring: 'Good condition',
        plumbing: 'Kitchen sink drain washer damaged',
      }),
      photosJson: JSON.stringify([
        {
          url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
          caption: 'Pre-exit inspection of hall wall scuffs',
          timestamp: new Date().toISOString(),
          sha256Hash: crypto.createHash('sha256').update('exit-hall').digest('hex'),
        },
      ]),
      tenantAgreed: false,
      ownerAgreed: true,
    },
  });

  // Itemized Deduction Items
  await prisma.depositDeductionItem.create({
    data: {
      depositRecordId: depositRecord1.id,
      category: 'PAINTING',
      description: 'Single wall touch-up and repaint for television bracket holes',
      claimedAmount: 2500,
      agreedAmount: 2500,
      proofPhotoUrl: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
      invoiceProofUrl: 'https://docs.rentease.internal/invoices/paint-quote-882.pdf',
      tenantApproved: true,
    },
  });

  await prisma.depositDeductionItem.create({
    data: {
      depositRecordId: depositRecord1.id,
      category: 'PLUMBING_REPAIR',
      description: 'Kitchen sink mixer tap cartridge replacement',
      claimedAmount: 1000,
      agreedAmount: 1000,
      proofPhotoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80',
      tenantApproved: false,
    },
  });

  // 5. Seed Maintenance Tickets (Module 4)
  await prisma.maintenanceTicket.create({
    data: {
      propertyId: prop1.id,
      tenantId: tenant2.id,
      title: 'Kitchen Tap High Pressure Leak',
      description: 'Water spraying vigorously underneath kitchen cabinet whenever main sink faucet is opened.',
      complaintInputType: 'TEXT',
      aiClassifiedCategory: 'PLUMBING',
      aiSuggestedUrgency: 'HIGH',
      slaHours: 12,
      slaDeadline: new Date(Date.now() + 10 * 60 * 60 * 1000),
      status: 'AWAITING_OWNER_APPROVAL',
      recommendedProviderJson: JSON.stringify({
        name: 'HydraFlow Plumbing Services',
        trade: 'PLUMBING',
        rating: 4.8,
        phone: '+91 98490 12345',
        estimatedCostRange: '₹500 - ₹2,500',
      }),
      assignedVendorName: 'HydraFlow Plumbing Services',
      assignedVendorPhone: '+91 98490 12345',
      quoteAmount: 1200,
      quoteDescription: 'Replace flexible connector hose and brass angle valve',
      quoteApprovedByOwner: false,
    },
  });

  await prisma.maintenanceTicket.create({
    data: {
      propertyId: prop2.id,
      tenantId: tenant1.id,
      title: 'Master Bedroom AC Not Cooling',
      description: 'Split air conditioner turns on and blows room temperature air, error code E4 displayed on unit.',
      complaintInputType: 'VOICE',
      audioTranscript: 'Master bedroom AC error E4 compressor not turning on in extreme heat.',
      aiClassifiedCategory: 'HVAC',
      aiSuggestedUrgency: 'HIGH',
      slaHours: 12,
      slaDeadline: new Date(Date.now() - 2 * 60 * 60 * 1000), // Passed SLA deadline -> Escalate!
      status: 'ESCALATED',
      isEscalated: true,
      escalatedAt: new Date(),
      recommendedProviderJson: JSON.stringify({
        name: 'CoolBreeze Air-Conditioning & HVAC',
        trade: 'HVAC',
        rating: 4.7,
        phone: '+91 98490 34567',
        estimatedCostRange: '₹1,200 - ₹5,500',
      }),
      assignedVendorName: 'CoolBreeze Air-Conditioning & HVAC',
      assignedVendorPhone: '+91 98490 34567',
      quoteAmount: 2400,
      quoteDescription: 'Refrigerant R32 gas recharge and condenser coil leak soldering',
      quoteApprovedByOwner: true,
    },
  });

  // Seed Initial Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SYSTEM_BOOTSTRAP_SEEDED',
      entityType: 'User',
      entityId: admin.id,
      detailsJson: JSON.stringify({
        propertiesSeeded: 4,
        usersSeeded: 5,
        agreementsSeeded: 1,
        depositRecordsSeeded: 1,
        ticketsSeeded: 2,
      }),
    },
  });

  console.log('✅ RentEase Ecosystem Seed Data successfully populated!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
