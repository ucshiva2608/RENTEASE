import React, { useState, useEffect } from 'react';
import { Shield, FileCheck, Hash, AlertOctagon, Scale, CheckCircle2, ChevronRight, ArrowDownRight } from 'lucide-react';
import { api } from '../services/api';
import { DepositGuardModal } from '../components/DepositGuardModal';
import { Property } from '../types';

interface Props {
  properties: Property[];
}

export const DepositGuardPage: React.FC<Props> = ({ properties }) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [activePropertyId, setActivePropertyId] = useState<string>(properties[0]?.id || '');

  // Pre-seed mock / live reference ID for interactive testing
  const [depositRecords, setDepositRecords] = useState<any[]>([
    {
      id: 'mock-dep-1',
      propertyTitle: 'Serene Heights 2BHK Luxury Living',
      propertyCity: 'Hyderabad',
      tenantName: 'Rahul Varma',
      ownerName: 'Venkat Rao',
      originalDepositAmount: 35000,
      totalDeductions: 3500,
      calculatedRefundAmount: 31500,
      escrowStatus: 'HELD_IN_ESCROW_ACCOUNT',
      refundStatus: 'PENDING',
      ownerSigned: true,
      tenantSigned: false,
      disputeRaised: false,
    },
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          <span>Module 3: RentEase DepositGuard</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          Security Deposit Escrow & Inspection Ledger
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
          Complete cryptographic tracking for move-in and move-out inspections, itemized damage calculations, mutual digital sign-offs, and fair dispute mediation.
        </p>
      </div>

      {/* Escrow Regulatory Notice */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-5 shadow-lg border border-blue-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm sm:text-base flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-300" />
            <span>Escrow & Regulatory Compliance Guarantee</span>
          </h3>
          <p className="text-xs text-blue-100 leading-relaxed max-w-2xl">
            RentEase records original security deposits and provides immutable cryptographic photo audits and itemized deduction calculations. Banking transfers settle securely via RBI-compliant escrow rails.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold whitespace-nowrap">
          Bank Escrow Connected
        </div>
      </div>

      {/* Deposit Records Ledger */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-sm text-slate-800">Active Security Deposit Ledgers</h3>
          <span className="text-xs text-slate-500">100% Immutable Audit Trail</span>
        </div>

        <div className="divide-y divide-slate-100">
          {depositRecords.map((dep) => (
            <div
              key={dep.id}
              className="p-5 hover:bg-slate-50/60 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{dep.propertyTitle}</h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {dep.propertyCity}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex items-center gap-3">
                  <span>Owner: <strong>{dep.ownerName}</strong></span>
                  <span>•</span>
                  <span>Tenant: <strong>{dep.tenantName}</strong></span>
                </div>
              </div>

              {/* Financial Snapshot */}
              <div className="flex items-center space-x-6 text-right">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">Original Deposit</span>
                  <span className="text-sm font-bold text-slate-800">₹{dep.originalDepositAmount.toLocaleString('en-IN')}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-rose-500 block">Deductions</span>
                  <span className="text-sm font-bold text-rose-600">-₹{dep.totalDeductions.toLocaleString('en-IN')}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-emerald-600 block">Net Refund Due</span>
                  <span className="text-base font-black text-emerald-700">₹{dep.calculatedRefundAmount.toLocaleString('en-IN')}</span>
                </div>

                <button
                  onClick={() => setSelectedRecordId(dep.id)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1"
                >
                  <span>Open Audit</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl w-fit">
            <Hash className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Cryptographic Photo Hashes</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Move-in and move-out photographs are stamped with cryptographic SHA-256 hashes to prevent retroactive tampering or dispute manipulation.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl w-fit">
            <FileCheck className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Itemized Cost Adjudication</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            No lump-sum withholding. All claimed repair deductions require invoice upload, item description, and transparent tenant approval.
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl w-fit">
            <Scale className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Mediation & Dispute Hub</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Tenants and owners can contest unfair charges. Platform compliance officers mediate based on initial move-in photographic records.
          </p>
        </div>
      </div>

      {/* Audit Modal */}
      {selectedRecordId && (
        <DepositGuardModal
          depositRecordId={selectedRecordId}
          onClose={() => setSelectedRecordId(null)}
        />
      )}
    </div>
  );
};
