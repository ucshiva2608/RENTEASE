import React, { useState } from 'react';
import { FileText, AlertTriangle, CheckCircle, Languages, Sparkles, X, ShieldAlert } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  propertyId?: string;
  initialText?: string;
  onClose: () => void;
}

export const AgreementAnalyzerModal: React.FC<Props> = ({ propertyId, initialText, onClose }) => {
  const [agreementText, setAgreementText] = useState<string>(
    initialText ||
      `This Residential Rental Agreement executed on 1st November 2026.
Between Lessor (Owner) and Lessee (Tenant) for Premises located at Plot 42, Gachibowli, Hyderabad.
1. The Lessee agrees to pay a monthly rent of Rs. 18,000 payable on or before 5th of every English calendar month.
2. The Lessee has deposited an interest-free refundable security deposit of Rs. 40,000.
3. Lock-in period for this agreement shall be 6 months.
4. Either party may terminate this agreement by giving 30 days prior written notice.
5. Annual escalation of rent shall be 5% upon renewal.`
  );
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleAnalyze = async () => {
    if (!agreementText.trim()) return;
    setLoading(true);
    try {
      const res = await api.analyzeAgreement(agreementText, propertyId);
      if (res.success) {
        setAnalysis(res.analysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-blue-800 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <FileText className="w-6 h-6 text-purple-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">Agreement Intelligence</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                  Module 5
                </span>
              </div>
              <p className="text-xs text-purple-100">Bilingual English & Telugu clause comprehension and risk analysis</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Agreement Input Box */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Agreement Draft / Clauses Text:
            </label>
            <textarea
              rows={4}
              value={agreementText}
              onChange={(e) => setAgreementText(e.target.value)}
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none"
              placeholder="Paste rental agreement draft clauses here..."
            />
            <div className="mt-2 text-right">
              <button
                onClick={handleAnalyze}
                disabled={loading || !agreementText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 ml-auto"
              >
                <Sparkles className="w-4 h-4" />
                {loading ? 'Analyzing with AI...' : 'Analyze Agreement Clauses'}
              </button>
            </div>
          </div>

          {analysis && (
            <div className="space-y-4 pt-2 border-t border-slate-200">
              {/* Extracted Core Financial & Term Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-purple-700 uppercase">Monthly Rent</span>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    ₹{analysis.monthlyRent.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-blue-700 uppercase">Security Deposit</span>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    ₹{analysis.securityDeposit.toLocaleString('en-IN')}
                  </div>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Notice Period</span>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {analysis.noticePeriodDays} Days
                  </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-center">
                  <span className="text-[10px] font-bold text-amber-700 uppercase">Annual Hike</span>
                  <div className="text-base font-extrabold text-slate-900 mt-0.5">
                    {analysis.escalationPercent}%
                  </div>
                </div>
              </div>

              {/* Side-by-Side English & Telugu Explanations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl">
                  <div className="flex items-center space-x-1.5 mb-1 text-slate-700">
                    <Languages className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">English Summary</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{analysis.summaryEn}</p>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-xl">
                  <div className="flex items-center space-x-1.5 mb-1 text-amber-800">
                    <Languages className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-bold uppercase tracking-wider">తెలుగు వివరణ (Telugu)</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-sans">{analysis.summaryTe}</p>
                </div>
              </div>

              {/* Missing Information / Risk Flags */}
              {analysis.missingInformationAlerts && analysis.missingInformationAlerts.length > 0 && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 space-y-1">
                  <div className="flex items-center space-x-1.5 font-bold text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>Missing Clauses or Risk Flags Detected:</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-rose-700 pl-1">
                    {analysis.missingInformationAlerts.map((alert: string, i: number) => (
                      <li key={i}>{alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Legal Disclaimer */}
              <div className="bg-slate-100 rounded-xl p-3 flex items-start space-x-2 text-[11px] text-slate-600 border border-slate-200">
                <ShieldAlert className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Statutory Notice:</strong> RentEase AI Agreement Intelligence provides automated clause parsing for convenience and transparency. This analysis does not constitute formal legal counsel. State tenancy laws govern in the event of dispute.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
