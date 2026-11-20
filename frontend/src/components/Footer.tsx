import React from 'react';
import { ShieldCheck, Heart, Scale, Lock, Eye } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white font-extrabold text-base">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              <span>RentEase Ecosystem</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Next-generation rental platform integrating AI-driven matching, multi-tier document verification, DepositGuard escrow tracking, and bilingual agreement intelligence.
            </p>
          </div>

          {/* Module Links */}
          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">AI & Trust Modules</h5>
            <ul className="space-y-2 text-xs">
              <li>Module 1: Trust & Multi-Tier Verification</li>
              <li>Module 2: Explainable AI Match Search</li>
              <li>Module 3: DepositGuard Escrow Ledger</li>
              <li>Module 4: AI Care Predictive Maintenance</li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Operational Intelligence</h5>
            <ul className="space-y-2 text-xs">
              <li>Module 5: Agreement Intelligence (EN/TE)</li>
              <li>Module 6: Owner Copilot Assistant</li>
              <li>Module 7: Neighborhood Amenity Radar</li>
              <li>Module 8: Multilingual Voice Assistant</li>
            </ul>
          </div>

          {/* Statutory Disclaimers */}
          <div className="space-y-2">
            <h5 className="text-white font-bold text-xs uppercase tracking-wider mb-3">Compliance & Disclaimers</h5>
            <div className="flex items-start space-x-2 text-slate-400 text-[11px] leading-relaxed">
              <Scale className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <span>Identity verification authenticates individual KYC. Never equates to legal ownership warranty without registered title review.</span>
            </div>
            <div className="flex items-start space-x-2 text-slate-400 text-[11px] leading-relaxed">
              <Lock className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>Deposit funds are settled through compliant banking escrow rails; RentEase maintains immutable audit tracking.</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500">
          <p>© 2026 RentEase Inc. Built with React, TypeScript, Node.js, Express & Prisma.</p>
          <div className="flex items-center space-x-4 mt-2 sm:mt-0">
            <span>DPDP & GDPR Compliant</span>
            <span>•</span>
            <span>Immutable Audit Logging Active</span>
            <span>•</span>
            <span>Role-Based Access Protected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
