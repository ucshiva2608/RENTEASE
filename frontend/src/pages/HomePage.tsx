import React from 'react';
import { ShieldCheck, Sparkles, Shield, Wrench, FileText, Bot, MapPin, Mic, ArrowRight, CheckCircle2, ChevronRight, IndianRupee } from 'lucide-react';
import { AIMatchSearchBar } from '../components/AIMatchSearchBar';
import { Property } from '../types';

interface Props {
  properties: Property[];
  onSearch: (query: string) => void;
  onOpenVoice: () => void;
  onOpenOwnerCopilot: () => void;
  onSelectProperty: (property: Property) => void;
  onOpenTrustBadge: (propertyId: string) => void;
  onOpenNeighborhood: (propertyId: string) => void;
  onNavigate: (view: string) => void;
}

export const HomePage: React.FC<Props> = ({
  properties,
  onSearch,
  onOpenVoice,
  onOpenOwnerCopilot,
  onSelectProperty,
  onOpenTrustBadge,
  onOpenNeighborhood,
  onNavigate,
}) => {
  const moduleCards = [
    {
      title: 'Trust & Verification',
      module: 'Module 1',
      desc: 'Owner KYC, deed inspection, location consistency & duplicate listing detection.',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      action: () => onNavigate('ADMIN'),
    },
    {
      title: 'AI Property Match',
      module: 'Module 2',
      desc: 'Natural language search with explainable criteria match breakdown.',
      icon: <Sparkles className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 text-blue-800',
      action: () => onNavigate('PROPERTIES'),
    },
    {
      title: 'DepositGuard Escrow',
      module: 'Module 3',
      desc: 'Move-in/out reports, timestamped photo hashes & itemized damage adjudication.',
      icon: <Shield className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800',
      action: () => onNavigate('DEPOSITGUARD'),
    },
    {
      title: 'AI Care Maintenance',
      module: 'Module 4',
      desc: 'Multi-modal triage, automated SLA deadlines & verified contractor quotation approvals.',
      icon: <Wrench className="w-5 h-5 text-amber-600" />,
      color: 'bg-amber-50 border-amber-200 text-amber-800',
      action: () => onNavigate('MAINTENANCE'),
    },
    {
      title: 'Agreement Intelligence',
      module: 'Module 5',
      desc: 'Clause extraction, bilingual English & Telugu explanations, and renewal reminders.',
      icon: <FileText className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 text-purple-800',
      action: () => onNavigate('AGREEMENTS'),
    },
    {
      title: 'Owner Copilot',
      module: 'Module 6',
      desc: 'Conversational portfolio assistant with authorized database tool execution.',
      icon: <Bot className="w-5 h-5 text-slate-800" />,
      color: 'bg-slate-100 border-slate-300 text-slate-900',
      action: onOpenOwnerCopilot,
    },
    {
      title: 'Neighborhood Radar',
      module: 'Module 7',
      desc: 'Verified hospitals, schools, transit, and drive/walk/transit commute analytics.',
      icon: <MapPin className="w-5 h-5 text-teal-600" />,
      color: 'bg-teal-50 border-teal-200 text-teal-800',
      action: () => {
        if (properties[0]) onOpenNeighborhood(properties[0].id);
      },
    },
    {
      title: 'Multilingual Voice AI',
      module: 'Module 8',
      desc: 'Speech-to-text and voice search in English, Telugu (తెలుగు) & Hindi (हिन्दी).',
      icon: <Mic className="w-5 h-5 text-rose-600" />,
      color: 'bg-rose-50 border-rose-200 text-rose-800',
      action: onOpenVoice,
    },
  ];

  return (
    <div className="space-y-16 animate-fade-in pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-2xl mx-2 sm:mx-6 mt-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>RentEase 2.0 – Next-Gen Real Estate Trust Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight sm:leading-none">
            Intelligent, Trust-Focused <br />
            <span className="bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              Rental Management Platform
            </span>
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
            Eliminate rental friction with authentic document reviews, explainable AI matching, DepositGuard escrow tracking, and bilingual agreement intelligence.
          </p>

          {/* AI Search Bar */}
          <div className="pt-4">
            <AIMatchSearchBar
              onSearch={onSearch}
              onOpenVoice={onOpenVoice}
            />
          </div>
        </div>
      </section>

      {/* 8 Advanced Modules Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600">
            Enterprise Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            8 Integrated AI & Innovation Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Engineered modularly with strict authorization, compliance safeguards, and real database verification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moduleCards.map((m, idx) => (
            <div
              key={idx}
              onClick={m.action}
              className={`p-5 rounded-2xl border transition duration-200 hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between ${m.color}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200/50">
                    {m.icon}
                  </div>
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/70">
                    {m.module}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">{m.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{m.desc}</p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-200/40 flex items-center justify-between text-xs font-bold text-slate-800">
                <span>Explore Module</span>
                <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Verified Properties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Verified Real Estate
            </span>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Recently Certified Properties
            </h2>
            <p className="text-xs text-slate-500">
              Vetted with identity KYC, ownership deeds, and location consistency.
            </p>
          </div>
          <button
            onClick={() => onNavigate('PROPERTIES')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>View All Listings</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.slice(0, 3).map((prop) => {
            let imgList = [];
            try {
              imgList = JSON.parse(prop.images);
            } catch {
              imgList = [prop.images];
            }
            const coverImage = imgList[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00';

            return (
              <div
                key={prop.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-md hover:shadow-xl transition overflow-hidden flex flex-col group"
              >
                {/* Photo Preview */}
                <div className="relative h-48 overflow-hidden bg-slate-100">
                  <img
                    src={coverImage}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                  {/* Trust Badge Pill */}
                  <div className="absolute top-3 left-3">
                    <button
                      onClick={() => onOpenTrustBadge(prop.id)}
                      className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-emerald-700 text-xs font-bold shadow-md border border-emerald-300 flex items-center gap-1 hover:bg-emerald-50 transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Trust Verified</span>
                    </button>
                  </div>

                  <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-black">
                    ₹{prop.monthlyRent.toLocaleString('en-IN')}/mo
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center text-xs text-slate-500 font-semibold gap-2">
                      <span>{prop.bedrooms} BHK</span>
                      <span>•</span>
                      <span>{prop.furnishing.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{prop.city}</span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{prop.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{prop.description}</p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => onOpenNeighborhood(prop.id)}
                      className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Neighborhood</span>
                    </button>

                    <button
                      onClick={() => onSelectProperty(prop)}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Details & Lease
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
