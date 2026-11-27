const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE = rawBaseUrl
  ? rawBaseUrl.endsWith('/api')
    ? rawBaseUrl
    : `${rawBaseUrl.replace(/\/+$/, '')}/api`
  : '/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('rentease_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const api = {
  // Auth
  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async me() {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return res.json();
  },

  async updateConsent(consentPersonalData: boolean, consentAuditLogging: boolean) {
    const res = await fetch(`${API_BASE}/auth/consent`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ consentPersonalData, consentAuditLogging }),
    });
    return res.json();
  },

  async verifyIdentity(docType: string, docNumber: string) {
    const res = await fetch(`${API_BASE}/auth/verify-identity`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ docType, docNumber }),
    });
    return res.json();
  },

  // Properties
  async getProperties(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/properties${qs ? '?' + qs : ''}`);
    return res.json();
  },

  async getProperty(id: string) {
    const res = await fetch(`${API_BASE}/properties/${id}`);
    return res.json();
  },

  async createProperty(propertyData: any) {
    const res = await fetch(`${API_BASE}/properties`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(propertyData),
    });
    return res.json();
  },

  // Module 1: Trust & Verification
  async getVerificationBadge(propertyId: string) {
    const res = await fetch(`${API_BASE}/trust/badge/${propertyId}`);
    return res.json();
  },

  async submitVerification(payload: any) {
    const res = await fetch(`${API_BASE}/trust/submit`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getPendingVerifications() {
    const res = await fetch(`${API_BASE}/trust/admin/pending`, { headers: getHeaders() });
    return res.json();
  },

  async reviewVerification(propertyId: string, decision: 'APPROVE' | 'REJECT', reviewNotes: string) {
    const res = await fetch(`${API_BASE}/trust/admin/review`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ propertyId, decision, reviewNotes }),
    });
    return res.json();
  },

  // Module 2: AI Match
  async aiMatchSearch(query: string) {
    const res = await fetch(`${API_BASE}/ai-match/search`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ query }),
    });
    return res.json();
  },

  // Module 3: DepositGuard
  async getDepositRecord(id: string) {
    const res = await fetch(`${API_BASE}/depositguard/record/${id}`, { headers: getHeaders() });
    return res.json();
  },

  async addInspectionReport(payload: any) {
    const res = await fetch(`${API_BASE}/depositguard/inspection`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async addItemizedDeduction(payload: any) {
    const res = await fetch(`${API_BASE}/depositguard/deduction`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async signDepositSettlement(depositRecordId: string, approved: boolean) {
    const res = await fetch(`${API_BASE}/depositguard/sign`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ depositRecordId, approved }),
    });
    return res.json();
  },

  async manageDispute(payload: any) {
    const res = await fetch(`${API_BASE}/depositguard/dispute`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Module 4: AI Care
  async createMaintenanceTicket(payload: any) {
    const res = await fetch(`${API_BASE}/ai-care/ticket`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getMaintenanceTickets(params: Record<string, string> = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/ai-care/tickets${qs ? '?' + qs : ''}`, { headers: getHeaders() });
    return res.json();
  },

  async manageQuotation(payload: any) {
    const res = await fetch(`${API_BASE}/ai-care/quotation`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  // Module 5: Agreement Intelligence
  async analyzeAgreement(agreementText: string, propertyId?: string) {
    const res = await fetch(`${API_BASE}/agreements/analyze`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ agreementText, propertyId }),
    });
    return res.json();
  },

  async getRenewalAlerts(days = 90) {
    const res = await fetch(`${API_BASE}/agreements/renewal-alerts?days=${days}`, { headers: getHeaders() });
    return res.json();
  },

  // Module 6: Owner Copilot
  async queryOwnerCopilot(message: string) {
    const res = await fetch(`${API_BASE}/owner-copilot/query`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message }),
    });
    return res.json();
  },

  // Module 7: Neighborhood Intelligence
  async getNeighborhood(propertyId: string) {
    const res = await fetch(`${API_BASE}/neighborhood/${propertyId}`);
    return res.json();
  },

  // Module 8: Voice Assistant
  async queryVoiceAssistant(transcript: string, language: 'en' | 'te' | 'hi') {
    const res = await fetch(`${API_BASE}/voice-assistant/query`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ transcript, language }),
    });
    return res.json();
  },

  // Audit Logs
  async getAuditLogs(limit = 50) {
    const res = await fetch(`${API_BASE}/audit?limit=${limit}`, { headers: getHeaders() });
    return res.json();
  },
};
