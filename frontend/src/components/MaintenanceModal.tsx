import React, { useState } from 'react';
import { Wrench, AlertTriangle, Clock, CheckCircle2, Mic, Image, UserCheck, X } from 'lucide-react';
import { api } from '../services/api';

interface Props {
  propertyId: string;
  onClose: () => void;
  onTicketCreated?: () => void;
}

export const MaintenanceModal: React.FC<Props> = ({ propertyId, onClose, onTicketCreated }) => {
  const [complaintText, setComplaintText] = useState<string>('');
  const [inputType, setInputType] = useState<'TEXT' | 'IMAGE' | 'VOICE'>('TEXT');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!complaintText.trim() && !photoUrl) return;
    setLoading(true);

    try {
      const res = await api.createMaintenanceTicket({
        propertyId,
        title: complaintText.slice(0, 40) || 'Maintenance Complaint',
        description: complaintText,
        complaintInputType: inputType,
        photoUrls: photoUrl ? [photoUrl] : [],
      });

      if (res.success) {
        setResult(res);
        if (onTicketCreated) onTicketCreated();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Wrench className="w-6 h-6 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">RentEase AI Care</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-medium">
                  Module 4
                </span>
              </div>
              <p className="text-xs text-amber-100">Multi-modal triage, urgency prediction & contractor dispatch</p>
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
          {!result ? (
            <div className="space-y-4">
              {/* Input Mode Selector */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                <button
                  onClick={() => setInputType('TEXT')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    inputType === 'TEXT' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
                  }`}
                >
                  Text Complaint
                </button>
                <button
                  onClick={() => setInputType('VOICE')}
                  className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                    inputType === 'VOICE' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-rose-500" /> Voice Intake
                </button>
                <button
                  onClick={() => setInputType('IMAGE')}
                  className={`flex-1 py-1.5 rounded-lg transition flex items-center justify-center gap-1 ${
                    inputType === 'IMAGE' ? 'bg-white shadow text-slate-800' : 'text-slate-500'
                  }`}
                >
                  <Image className="w-3.5 h-3.5 text-blue-500" /> Photo Upload
                </button>
              </div>

              {/* Text Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Describe the issue:
                </label>
                <textarea
                  rows={3}
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="e.g. Master bedroom AC stopped cooling in severe heat / Kitchen sink pipe burst and flooding..."
                  className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Photo Input (Optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Photo Evidence URL (Optional):
                </label>
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={loading || (!complaintText.trim() && !photoUrl)}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  {loading ? 'AI Classifying & Matching Contractors...' : 'Submit Maintenance Ticket'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900">Maintenance Ticket Logged Successfully</h4>
                  <p className="text-xs text-emerald-700">Ticket ID: {result.ticket.id.slice(0, 8)}</p>
                </div>
              </div>

              {/* AI Assessment Report */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">AI Category</span>
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full">
                    {result.aiAssessment.category}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Predicted Urgency</span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                      result.aiAssessment.urgency === 'EMERGENCY'
                        ? 'bg-rose-100 text-rose-800'
                        : result.aiAssessment.urgency === 'HIGH'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {result.aiAssessment.urgency}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Resolution SLA</span>
                  <span className="text-xs font-extrabold text-slate-900 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    {result.aiAssessment.slaHours} Hours Guaranteed
                  </span>
                </div>

                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase">AI Reasoning:</span>
                  <p className="text-xs text-slate-700 mt-0.5 italic">{result.aiAssessment.reasoning}</p>
                </div>
              </div>

              {/* Matched Contractor */}
              <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4 space-y-1">
                <span className="text-[11px] font-bold text-amber-800 uppercase flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-amber-600" /> Recommended Verified Contractor:
                </span>
                <div className="text-sm font-bold text-slate-900">
                  {result.aiAssessment.recommendedProvider.name}
                </div>
                <div className="text-xs text-slate-600">
                  Rating: ⭐ {result.aiAssessment.recommendedProvider.rating} | Estimated: {result.aiAssessment.recommendedProvider.estimatedCostRange}
                </div>
                <div className="text-xs text-slate-500">
                  Contact: {result.aiAssessment.recommendedProvider.phone}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
