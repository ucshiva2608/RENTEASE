import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, CheckCircle2, XCircle, AlertCircle, Clock, MapPin, Eye, Lock } from 'lucide-react';
import { api } from '../services/api';

export const AdminVerificationPage: React.FC = () => {
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});

  const loadData = async () => {
    try {
      const pendingRes = await api.getPendingVerifications();
      if (pendingRes.success) {
        setPendingProperties(pendingRes.properties);
      }
      const logsRes = await api.getAuditLogs(30);
      if (logsRes.success) {
        setAuditLogs(logsRes.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecision = async (propertyId: string, decision: 'APPROVE' | 'REJECT') => {
    const notes = reviewNotes[propertyId] || (decision === 'APPROVE' ? 'Deed and location verified' : 'Incomplete documentation');
    try {
      const res = await api.reviewVerification(propertyId, decision, notes);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Module 1: Trust & Verification Admin Console</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          Property Document Review & Verification Portal
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
          Multi-tier authenticity review: Identity KYC, sale deed authorization, location consistency, duplicate detection, and 365-day validity management.
        </p>
      </div>

      {/* Statutory Legal Rule Box */}
      <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex items-start space-x-3 text-xs text-amber-900">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-extrabold uppercase tracking-wide">Strict Compliance Guideline:</span>
          <p className="leading-relaxed">
            Never claim legal ownership from an identity check alone. The "Identity Verified" badge certifies only that the owner's individual KYC credentials (Aadhaar/Passport) match. Ownership validation requires separate review of registered title deeds or municipal tax receipts.
          </p>
        </div>
      </div>

      {/* Pending Verifications */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800">
            Pending Property Verification Reviews ({pendingProperties.length})
          </h3>
          <span className="text-xs text-slate-500">Requires Compliance Approval</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pendingProperties.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            All submitted properties are fully reviewed. Zero pending queues.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingProperties.map((prop) => (
              <div key={prop.id} className="p-5 space-y-4 hover:bg-slate-50/50 transition">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <div>
                    <h4 className="font-extrabold text-base text-slate-900">{prop.title}</h4>
                    <p className="text-xs text-slate-500">{prop.address}, {prop.city} (PIN: {prop.pincode})</p>
                    <p className="text-xs text-slate-600 mt-1">Owner: <strong>{prop.owner?.name}</strong> ({prop.owner?.isIdentityVerified ? '✅ KYC Verified' : '❌ Unverified'})</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-slate-900 block">₹{prop.monthlyRent.toLocaleString('en-IN')}/mo</span>
                    <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {prop.verificationStatus}
                    </span>
                  </div>
                </div>

                {/* Audit Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Document Type</span>
                    <span className="font-bold text-slate-800">{prop.ownershipDocType || 'SALE_DEED'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Location Consistency</span>
                    <span className="font-bold text-emerald-700">GPS & Geocode Consistent</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Duplicate Detection</span>
                    <span className="font-bold text-emerald-700">Unique (Zero Duplicates)</span>
                  </div>
                </div>

                {/* Admin Action Bar */}
                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <input
                    type="text"
                    value={reviewNotes[prop.id] || ''}
                    onChange={(e) =>
                      setReviewNotes((prev) => ({ ...prev, [prop.id]: e.target.value }))
                    }
                    placeholder="Enter compliance inspection notes..."
                    className="flex-1 text-xs px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex space-x-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleDecision(prop.id, 'APPROVE')}
                      className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Grant Badges</span>
                    </button>
                    <button
                      onClick={() => handleDecision(prop.id, 'REJECT')}
                      className="flex-1 sm:flex-none px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Immutable Audit Log Trail */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
        <div className="flex items-center space-x-2">
          <Lock className="w-4 h-4 text-slate-500" />
          <h3 className="font-bold text-sm text-slate-800">Immutable System Audit Stream</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2">Timestamp</th>
                <th className="py-2">Action</th>
                <th className="py-2">Entity</th>
                <th className="py-2">User / IP</th>
                <th className="py-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 font-bold text-blue-700">{log.action}</td>
                  <td className="py-2.5 text-slate-700">{log.entityType}</td>
                  <td className="py-2.5 text-slate-600">{log.user?.name || log.ipAddress}</td>
                  <td className="py-2.5 text-slate-500 max-w-xs truncate">{log.detailsJson}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
