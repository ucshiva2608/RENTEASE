import React, { useState } from 'react';
import { Sparkles, ShieldCheck, MapPin, Wrench, FileText, CheckCircle2, AlertCircle, Filter } from 'lucide-react';
import { Property, AIMatchResult } from '../types';
import { AIMatchSearchBar } from '../components/AIMatchSearchBar';

interface Props {
  properties: Property[];
  aiMatchResults: AIMatchResult[] | null;
  currentSearchQuery: string;
  onSearch: (query: string) => void;
  onOpenVoice: () => void;
  onOpenTrustBadge: (propertyId: string) => void;
  onOpenNeighborhood: (propertyId: string) => void;
  onOpenAgreementAnalyzer: (propertyId: string) => void;
  onOpenMaintenanceModal: (propertyId: string) => void;
  onSelectProperty: (property: Property) => void;
}

export const PropertiesPage: React.FC<Props> = ({
  properties,
  aiMatchResults,
  currentSearchQuery,
  onSearch,
  onOpenVoice,
  onOpenTrustBadge,
  onOpenNeighborhood,
  onOpenAgreementAnalyzer,
  onOpenMaintenanceModal,
  onSelectProperty,
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('ALL');

  // Display items: either AI match results or general properties list
  const displayItems = aiMatchResults
    ? aiMatchResults
    : properties.map((p) => ({ property: p, matchScore: 100, explanations: ['Standard listing in platform registry'] }));

  const filteredItems = displayItems.filter((item) => {
    if (selectedCity === 'ALL') return true;
    return item.property.city.toLowerCase() === selectedCity.toLowerCase();
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Search Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Module 2: RentEase AI Match</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900">
          Intelligent Property Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Natural-language semantic matching returning verified properties with explainable recommendation breakdowns.
        </p>

        <div className="pt-2">
          <AIMatchSearchBar
            onSearch={onSearch}
            onOpenVoice={onOpenVoice}
            initialQuery={currentSearchQuery}
          />
        </div>
      </div>

      {/* Filter Bar & Match Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter by City:</span>
          {['ALL', 'Hyderabad', 'Bengaluru', 'Pune'].map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCity(c)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                selectedCity === c
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing <strong>{filteredItems.length}</strong> matching verified properties
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item, idx) => {
          const prop = item.property;
          let imgList = [];
          try {
            imgList = JSON.parse(prop.images);
          } catch {
            imgList = [prop.images];
          }
          const coverImage = imgList[0] || 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00';

          return (
            <div
              key={prop.id || idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition overflow-hidden flex flex-col justify-between group"
            >
              <div>
                {/* Photo Preview & Badges */}
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={coverImage}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {/* Trust Badge Clickable */}
                  <div className="absolute top-3 left-3">
                    <button
                      onClick={() => onOpenTrustBadge(prop.id)}
                      className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md text-emerald-700 text-xs font-bold shadow-md border border-emerald-300 flex items-center gap-1 hover:bg-emerald-50 transition"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Trust Badge</span>
                    </button>
                  </div>

                  {/* Explainable AI Match Score Badge */}
                  {aiMatchResults && (
                    <div className="absolute top-3 right-3 bg-blue-600/95 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>{item.matchScore}% Match</span>
                    </div>
                  )}

                  <div className="absolute bottom-3 right-3 bg-slate-900/85 backdrop-blur-sm text-white px-3 py-1 rounded-xl text-xs font-black">
                    ₹{prop.monthlyRent.toLocaleString('en-IN')}/mo
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <div className="flex items-center text-xs text-slate-500 font-semibold gap-2 mb-1">
                      <span>{prop.bedrooms} BHK</span>
                      <span>•</span>
                      <span>{prop.furnishing.replace('_', ' ')}</span>
                      <span>•</span>
                      <span>{prop.city}</span>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">{prop.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prop.description}</p>
                  </div>

                  {/* AI Match Explainability Box */}
                  {item.explanations && item.explanations.length > 0 && (
                    <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 space-y-1">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-blue-700 block">
                        Why this matches your query:
                      </span>
                      <ul className="space-y-0.5 text-slate-700">
                        {item.explanations.slice(0, 3).map((exp, eIdx) => (
                          <li key={eIdx} className="flex items-start gap-1.5 text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenNeighborhood(prop.id)}
                    title="View Nearby Amenities & Commute Times (Module 7)"
                    className="p-1.5 text-slate-600 hover:text-teal-700 hover:bg-teal-50 rounded-lg transition"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenAgreementAnalyzer(prop.id)}
                    title="Analyze Agreement in English & Telugu (Module 5)"
                    className="p-1.5 text-slate-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onOpenMaintenanceModal(prop.id)}
                    title="Log AI Care Maintenance Request (Module 4)"
                    className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                  >
                    <Wrench className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onSelectProperty(prop)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs transition"
                >
                  View Details
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
