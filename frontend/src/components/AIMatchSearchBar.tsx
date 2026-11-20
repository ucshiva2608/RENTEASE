import React, { useState } from 'react';
import { Search, Sparkles, Mic, ArrowRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  onSearch: (query: string) => void;
  onOpenVoice: () => void;
  initialQuery?: string;
}

export const AIMatchSearchBar: React.FC<Props> = ({ onSearch, onOpenVoice, initialQuery = '' }) => {
  const [query, setQuery] = useState<string>(initialQuery);
  const { t } = useLanguage();

  const sampleQueries = [
    'Find a furnished 2BHK in Hyderabad under ₹18,000 with parking',
    '3BHK luxury flat in Banjara Hills under ₹40,000 with pool',
    'Studio apartment in Madhapur near metro under ₹15,000',
    '2BHK in Indiranagar Bengaluru under ₹35,000',
  ];

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  const handleChipClick = (sample: string) => {
    setQuery(sample);
    onSearch(sample);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      {/* Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-4 pointer-events-none text-blue-600">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full pl-12 pr-28 py-4 bg-white rounded-2xl shadow-xl border border-slate-200/80 text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-600 transition"
        />

        {/* Buttons inside bar */}
        <div className="absolute right-2.5 flex items-center space-x-1.5">
          <button
            type="button"
            onClick={onOpenVoice}
            title="Search with Voice (English / Telugu / Hindi)"
            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition"
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            type="submit"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition flex items-center gap-1"
          >
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">AI Match</span>
          </button>
        </div>
      </form>

      {/* Suggested Search Chips */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
        <span className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
          Try asking:
        </span>
        {sampleQueries.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleChipClick(sample)}
            className="bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200/80 hover:border-blue-300 px-3 py-1.5 rounded-full shadow-sm transition whitespace-nowrap text-left"
          >
            "{sample}"
          </button>
        ))}
      </div>
    </div>
  );
};
