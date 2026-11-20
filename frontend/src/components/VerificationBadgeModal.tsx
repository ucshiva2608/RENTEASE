import React, { useEffect, useState } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle, XCircle, Clock, FileText, MapPin, Camera, X } from 'lucide-react';
import { api } from '../services/api';
import { VerificationBadgeReport } from '../types';

interface Props {
  propertyId: string;
  onClose: () => void;
}

export const VerificationBadgeModal: React.FC<Props> = ({ propertyId, onClose }) => {
  const [report, setReport] = useState<VerificationBadgeReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.getVerificationBadge(propertyId);
        if (res.success) {
          setReport(res);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [propertyId]);

  const getLevelIcon = (id: string, active: boolean) => {
    if (!active) return <XCircle className="w-5 h-5 text-slate-300" />;
    switch (id) {
      case 'identity':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'ownership':
        return <FileText className="w-5 h-5 text-emerald-600" />;
      case 'location':
        return <MapPin className="w-5 h-5 text-emerald-600" />;
      case 'media':
        return <Camera className="w-5 h-5 text-emerald-600" />;
      case 'recent':
        return <Clock className="w-5 h-5 text-emerald-600" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 text-white flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md border border-white/20">
              <ShieldCheck className="w-7 h-7 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-bold">RentEase Trust & Verification</h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-medium">
                  Module 1
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-1">Multi-tier authentic property verification audit report</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : report ? (
            <>
              {/* Trust Score Header */}
              <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Overall Authenticity</span>
                  <div className="flex items-baseline space-x-2 mt-0.5">
                    <span className="text-3xl font-extrabold text-slate-800">{report.trustScore}%</span>
                    <span className="text-sm font-medium text-emerald-600">
                      {report.trustScore >= 80 ? 'High-Trust Certified' : 'Partially Verified'}
                    </span>
                  </div>
                  {report.verificationExpiry && (
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Expiry: {new Date(report.verificationExpiry).toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                      report.verificationStatus === 'VERIFIED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-amber-100 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {report.verificationStatus}
                  </span>
                </div>
              </div>

              {/* 5 Transparent Verification Levels */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  5 Verification Pillars
                </h4>
                {report.levels.map((level) => (
                  <div
                    key={level.id}
                    className={`p-3.5 rounded-xl border transition ${
                      level.active
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50 border-slate-200 opacity-60'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="mt-0.5">{getLevelIcon(level.id, level.active)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-slate-900">{level.title}</h5>
                          <span
                            className={`text-xs font-semibold ${
                              level.active ? 'text-emerald-700' : 'text-slate-400'
                            }`}
                          >
                            {level.active ? 'Verified' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{level.description}</p>
                        {level.legalDisclaimer && (
                          <p className="text-[11px] text-amber-700/90 mt-1 italic font-medium">
                            * {level.legalDisclaimer}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Critical Legal Disclosure */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-amber-900">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Statutory Legal Disclosure:</span>
                  <p className="leading-relaxed">
                    Identity verification confirms owner identity KYC credentials only. It does <strong>never claim legal ownership</strong> from an identity check alone without full registered deed and encumbrance certificate inspection.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-slate-500 py-6">Could not load verification records.</p>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
