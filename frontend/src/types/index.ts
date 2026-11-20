export type UserRole = 'OWNER' | 'TENANT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  isIdentityVerified: boolean;
  identityDocType?: string;
  identityDocNumberMasked?: string;
  consentPersonalData: boolean;
  aiQueryQuotaRemaining: number;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  monthlyRent: number;
  securityDeposit: number;
  bedrooms: number;
  bathrooms: number;
  furnishing: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  propertyType: 'APARTMENT' | 'INDEPENDENT_HOUSE' | 'VILLA' | 'STUDIO';
  amenities: string;
  squareFeet: number;
  isAvailable: boolean;
  images: string;
  videoUrl?: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
  verificationExpiry?: string;
  badgeIdentityVerified: boolean;
  badgeOwnershipDocsReviewed: boolean;
  badgeLocationVerified: boolean;
  badgeMediaVerified: boolean;
  badgeRecentlyConfirmed: boolean;
  ownershipDocType?: string;
  duplicateListingDetected?: boolean;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    isIdentityVerified: boolean;
  };
}

export interface VerificationLevel {
  id: string;
  title: string;
  active: boolean;
  description: string;
  legalDisclaimer?: string;
}

export interface VerificationBadgeReport {
  verificationStatus: string;
  trustScore: number;
  levels: VerificationLevel[];
  isExpired: boolean;
  verificationExpiry?: string;
  duplicateWarning?: string | null;
}

export interface AIMatchResult {
  property: Property;
  matchScore: number;
  explanations: string[];
}

export interface DepositDeductionItem {
  id: string;
  category: string;
  description: string;
  claimedAmount: number;
  agreedAmount: number;
  proofPhotoUrl?: string;
  tenantApproved: boolean;
}

export interface InspectionPhoto {
  url: string;
  caption?: string;
  timestamp: string;
  sha256Hash: string;
}

export interface InspectionReport {
  id: string;
  inspectionType: 'MOVE_IN' | 'MOVE_OUT';
  inspectorName: string;
  inspectionDate: string;
  overallCondition: string;
  checklistJson: string;
  photosJson: string;
  tenantAgreed: boolean;
  ownerAgreed: boolean;
}

export interface DepositRecord {
  id: string;
  propertyId: string;
  property: Property;
  tenantId: string;
  tenant: User;
  ownerId: string;
  owner: User;
  originalDepositAmount: number;
  depositPaidDate: string;
  receiptReference: string;
  escrowStatus: string;
  disclaimer: string;
  totalDeductions: number;
  calculatedRefundAmount: number;
  ownerSigned: boolean;
  tenantSigned: boolean;
  disputeRaised: boolean;
  disputeReason?: string;
  disputeStatus: string;
  refundStatus: string;
  inspections: InspectionReport[];
  deductionItems: DepositDeductionItem[];
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  property: Property;
  tenantId: string;
  tenant: User;
  title: string;
  description: string;
  complaintInputType: 'TEXT' | 'IMAGE' | 'VOICE';
  audioTranscript?: string;
  aiClassifiedCategory: string;
  aiSuggestedUrgency: 'EMERGENCY' | 'HIGH' | 'MEDIUM' | 'LOW';
  slaHours: number;
  slaDeadline: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'AWAITING_OWNER_APPROVAL' | 'COMPLETED' | 'ESCALATED';
  isEscalated: boolean;
  recommendedProviderJson?: string;
  assignedVendorName?: string;
  assignedVendorPhone?: string;
  quoteAmount?: number;
  quoteDescription?: string;
  quoteApprovedByOwner: boolean;
  repairEvidencePhotosJson?: string;
  createdAt: string;
}

export interface RentalAgreement {
  id: string;
  propertyId: string;
  property: Property;
  ownerId: string;
  owner: User;
  tenantId: string;
  tenant: User;
  startDate: string;
  endDate: string;
  monthlyRent: number;
  securityDeposit: number;
  lockInPeriodMonths: number;
  noticePeriodDays: number;
  escalationPercent: number;
  stateJurisdiction: string;
  status: string;
  aiSummaryEn?: string;
  aiSummaryTe?: string;
  missingInformationAlerts?: string;
  listingDiscrepancyNotes?: string;
  disclaimer: string;
}

export interface NearbyPlace {
  id: string;
  name: string;
  category: 'HOSPITAL' | 'SCHOOL' | 'COLLEGE' | 'TRANSIT' | 'SHOPPING' | 'RESTAURANT';
  distanceKm: number;
  driveTimeMins: number;
  transitTimeMins: number;
  walkTimeMins: number;
  rating: number;
  address: string;
}

export interface NeighborhoodOverview {
  transitScore: number;
  familyScore: number;
  dailyConvenienceScore: number;
  overallLivability: number;
  amenities: NearbyPlace[];
}
