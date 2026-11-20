import React, { useState, useEffect } from 'react';
import { Shield, FileCheck, CheckCircle2, AlertOctagon, Scale, Hash, ArrowDownRight, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface Props {
  depositRecordId: string;
  onClose: () => void;
}

export const DepositGuardModal: React.FC<Props> = ({ depositRecordId, onClose }) => {
  const { user } = useAuth();
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'INSPECTIONS' | 'DEDUCTIONS' | 'DISPUTE'>('OVERVIEW');
  const [disputeReason, setDisputeReason] = useState<string>('');

  const loadData = async () => {
    try {
      const res = await api.getDepositRecord(depositRecordId);
      if (res.success) {
        setRecord(res.depositRecord);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [depositRecordId]);

  const handleSign = async (approved: boolean) => {
    try {
      const res = await api.signDepositSettlement(depositRecordId, approved);
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDispute = async (action: 'RAISE' | 'RESOLVE') => {
    try {
      const res = await api.manageDispute({
        depositRecordId,
        action,
        reason: disputeReason,
      });
      if (res.success) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-800 via-indigo-800 to-slate-900 p-5 text-white flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
              <Shield className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold">RentEase DepositGuard</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 font-medium">
                  Module 3
                </span>
              </div>
              <p className="text-xs text-blue-200">Cryptographic inspection audits, itemized deductions & dispute resolution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold px-4 pt-2">
          {[
            { id: 'OVERVIEW', label: 'Financial Settlement' },
            { id: 'INSPECTIONS', label: 'Photo Audit Hashes' },
            { id: 'DEDUCTIONS', label: 'Itemized Deductions' },
            { id: 'DISPUTE', label: 'Dispute Adjudication' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3 border-b-2 font-bold transition ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : record ? (
            <>
              {activeTab === 'OVERVIEW' && (
                <div className="space-y-5">
                  {/* Ledger Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center">
                      <span className="text-xs text-slate-500 font-semibold uppercase">Original Deposit</span>
                      <div className="text-xl font-black text-slate-900 mt-1">
                        ₹{record.originalDepositAmount?.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Ref: {record.receiptReference}</span>
                    </div>

                    <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-center">
                      <span className="text-xs text-rose-600 font-semibold uppercase">Approved Deductions</span>
                      <div className="text-xl font-black text-rose-700 mt-1">
                        -₹{record.totalDeductions?.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-rose-500">Damage / Maintenance</span>
                    </div>

                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 text-center">
                      <span className="text-xs text-emerald-700 font-semibold uppercase">Net Refund Due</span>
                      <div className="text-xl font-black text-emerald-800 mt-1">
                        ₹{record.calculatedRefundAmount?.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">
                        {record.refundStatus}
                      </span>
                    </div>
                  </div>

                  {/* Mutual Sign-off Checklist */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Mutual Sign-off & Escrow Clearance
                    </h5>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex items-center space-x-2">
                        <FileCheck className={`w-5 h-5 ${record.ownerSigned ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            Owner Signature: {record.owner?.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {record.ownerSigned ? `Signed & Approved` : 'Pending Owner Digital Sign'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <FileCheck className={`w-5 h-5 ${record.tenantSigned ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-bold text-slate-800">
                            Tenant Signature: {record.tenant?.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {record.tenantSigned ? `Signed & Approved` : 'Pending Tenant Digital Sign'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex justify-end">
                      <button
                        onClick={() => handleSign(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                      >
                        Sign & Authorize Settlement
                      </button>
                    </div>
                  </div>

                  {/* Escrow Disclaimer */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-[11px] text-blue-900 leading-relaxed">
                    <strong>Statutory Escrow Policy:</strong> {record.disclaimer}
                  </div>
                </div>
              )}

              {activeTab === 'INSPECTIONS' && (
                <div className="space-y-4">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Timestamped Cryptographic Photo Audits
                  </h5>
                  {record.inspections?.length === 0 ? (
                    <p className="text-xs text-slate-500">No inspections logged yet.</p>
                  ) : (
                    record.inspections?.map((insp: any) => {
                      let photos = [];
                      try {
                        photos = JSON.parse(insp.photosJson);
                      } catch {}
                      return (
                        <div key={insp.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                              {insp.inspectionType.replace('_', ' ')} REPORT ({insp.overallCondition})
                            </span>
                            <span className="text-[10px] text-slate-500">
                              By {insp.inspectorName} on {new Date(insp.inspectionDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {photos.map((p: any, idx: number) => (
                              <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200 text-[11px] space-y-1">
                                <p className="font-semibold text-slate-800">{p.caption}</p>
                                <div className="flex items-center text-[10px] text-slate-500 font-mono bg-slate-100 p-1 rounded overflow-hidden text-ellipsis">
                                  <Hash className="w-3 h-3 text-slate-400 mr-1 flex-shrink-0" />
                                  <span className="truncate">{p.sha256Hash}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {activeTab === 'DEDUCTIONS' && (
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    Itemized Damage & Repair Deductions
                  </h5>
                  {record.deductionItems?.length === 0 ? (
                    <p className="text-xs text-slate-500">Zero deductions claimed.</p>
                  ) : (
                    record.deductionItems?.map((item: any) => (
                      <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-slate-900">{item.category.replace('_', ' ')}</span>
                          <p className="text-slate-500 mt-0.5">{item.description}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-black text-rose-600">₹{item.agreedAmount.toLocaleString('en-IN')}</span>
                          <div className="text-[10px] text-slate-400">
                            {item.tenantApproved ? 'Tenant Agreed' : 'Pending Review'}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'DISPUTE' && (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center space-x-2 text-amber-800 font-bold text-xs">
                      <Scale className="w-4 h-4 text-amber-600" />
                      <span>DepositGuard Mediation & Dispute Status: {record.disputeStatus}</span>
                    </div>
                    {record.disputeRaised && (
                      <p className="text-xs text-amber-900">
                        <strong>Reason:</strong> {record.disputeReason}
                      </p>
                    )}
                  </div>

                  {!record.disputeRaised ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700">Contest Deduction / Raise Dispute:</label>
                      <textarea
                        rows={3}
                        value={disputeReason}
                        onChange={(e) => setDisputeReason(e.target.value)}
                        placeholder="State why you contest this deduction item (e.g. preexisting wear documented during move-in)..."
                        className="w-full text-xs p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleDispute('RAISE')}
                        disabled={!disputeReason.trim()}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md transition"
                      >
                        Submit Dispute to Admin Mediation
                      </button>
                    </div>
                  ) : (
                    <div className="text-right">
                      <button
                        onClick={() => handleDispute('RESOLVE')}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
                      >
                        Resolve & Accept Mediation
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-slate-500 py-6">Could not load deposit record.</p>
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
