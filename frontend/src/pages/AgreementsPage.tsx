import React, { useState, useEffect } from 'react';
import { FileText, AlertTriangle, Clock, Languages, Sparkles, CheckCircle2, ChevronRight, Scale } from 'lucide-react';
import { api } from '../services/api';
import { AgreementAnalyzerModal } from '../components/AgreementAnalyzerModal';
import { Property } from '../types';

interface Props {
  properties: Property[];
}

export const AgreementsPage: React.FC<Props> = ({ properties }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAnalyzerOpen, setIsAnalyzerOpen] = useState<boolean>(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(properties[0]?.id || '');

  const loadAlerts = async () => {
    try {
      const res = await api.getRenewalAlerts(90);
      if (res.success) {
        setAlerts(res.alerts);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold">
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Module 5: RentEase Agreement Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
            Smart Document Assistant & Renewal Tracker
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
            Bilingual clause comprehension in English & Telugu, risk detection, notice period alerts, and listing parity verification.
          </p>
        </div>

        <button
          onClick={() => setIsAnalyzerOpen(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>Analyze Agreement Clauses</span>
        </button>
      </div>

      {/* Proactive Renewal & Notice Reminders */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Active Renewal Alerts & Notice Windows</span>
          </h3>
          <span className="text-xs font-semibold text-slate-400">90-Day Forecast</span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-400 text-xs">
            No leases expiring within the next 90 days.
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.agreementId}
              className={`bg-white rounded-2xl border p-5 shadow-sm space-y-4 ${
                alert.isWithinNoticeWindow
                  ? 'border-amber-400 bg-amber-50/20 ring-2 ring-amber-200'
                  : 'border-slate-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-base text-slate-900">{alert.property?.title}</h4>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {alert.property?.city}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Tenant: <strong>{alert.tenant?.name}</strong> | Monthly Rent: <strong>₹{alert.monthlyRent.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-black text-slate-900">
                    {alert.daysRemaining} Days Left
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      alert.isWithinNoticeWindow
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {alert.isWithinNoticeWindow ? 'Mandatory Notice Window' : 'Renewal Window'}
                  </span>
                </div>
              </div>

              {/* Action Suggestion */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <p>
                  <strong>Action Recommended:</strong> {alert.renewalActionSuggested}
                </p>
              </div>

              {/* Telugu & English side by side summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-200/60">
                  <span className="text-[10px] font-bold uppercase text-purple-700 block mb-1">
                    English Synopsis:
                  </span>
                  <p className="text-slate-700 leading-relaxed">{alert.englishSummary}</p>
                </div>

                <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] font-bold uppercase text-amber-800 block mb-1">
                    తెలుగు సారాంశం (Telugu Summary):
                  </span>
                  <p className="text-amber-950 leading-relaxed font-sans">{alert.teluguSummary}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Analyzer Modal */}
      {isAnalyzerOpen && (
        <AgreementAnalyzerModal
          propertyId={selectedPropertyId}
          onClose={() => setIsAnalyzerOpen(false)}
        />
      )}
    </div>
  );
};
