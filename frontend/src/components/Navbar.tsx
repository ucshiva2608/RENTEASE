import React, { useState } from 'react';
import { Home, Shield, Sparkles, Wrench, FileText, Bot, Mic, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage, Language } from '../context/LanguageContext';

interface Props {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenVoice: () => void;
  onOpenOwnerCopilot: () => void;
}

export const Navbar: React.FC<Props> = ({
  currentView,
  onNavigate,
  onOpenVoice,
  onOpenOwnerCopilot,
}) => {
  const { user, quickSwitchRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div
          onClick={() => handleNavClick('HOME')}
          className="flex items-center space-x-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-md group-hover:scale-105 transition">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-blue-700 to-indigo-800 bg-clip-text text-transparent">
                RentEase
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">
                AI 2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Intelligent Rental Ecosystem</p>
          </div>
        </div>

        {/* Center Module Navigation (Desktop) */}
        <nav className="hidden md:flex items-center space-x-1 text-xs font-semibold text-slate-600">
          <button
            onClick={() => handleNavClick('PROPERTIES')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              currentView === 'PROPERTIES' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>AI Match</span>
          </button>

          <button
            onClick={() => handleNavClick('DEPOSITGUARD')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              currentView === 'DEPOSITGUARD' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-indigo-600" />
            <span>DepositGuard</span>
          </button>

          <button
            onClick={() => handleNavClick('MAINTENANCE')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              currentView === 'MAINTENANCE' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-amber-600" />
            <span>AI Care</span>
          </button>

          <button
            onClick={() => handleNavClick('AGREEMENTS')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              currentView === 'AGREEMENTS' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-purple-600" />
            <span>Agreements</span>
          </button>

          <button
            onClick={() => handleNavClick('ADMIN')}
            className={`px-3 py-2 rounded-xl transition flex items-center gap-1.5 ${
              currentView === 'ADMIN' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Trust Portal</span>
          </button>
        </nav>

        {/* Right Action Tools: Voice + Copilot + Language + Role Switcher + Mobile Toggle */}
        <div className="flex items-center space-x-2">
          {/* Voice Assistant Shortcut */}
          <button
            onClick={onOpenVoice}
            title="Multilingual Voice Assistant"
            className="flex items-center space-x-1.5 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Mic className="w-3.5 h-3.5 animate-pulse" />
            <span className="hidden sm:inline">Voice AI</span>
          </button>

          {/* Owner Copilot Trigger */}
          <button
            onClick={onOpenOwnerCopilot}
            title="Owner Copilot"
            className="flex items-center space-x-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <Bot className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Copilot</span>
          </button>

          {/* Language Selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl px-2.5 py-2 text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="en">EN</option>
            <option value="te">తెలుగు</option>
            <option value="hi">हिन्दी</option>
          </select>

          {/* Role Quick Switcher (Desktop) */}
          <div className="border-l border-slate-200 pl-2 hidden lg:flex items-center space-x-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Role:</span>
            {(['OWNER', 'TENANT', 'ADMIN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => quickSwitchRole(r)}
                className={`text-[10px] font-bold px-2 py-1 rounded-md transition ${
                  user?.role === r
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation (Phones & Tablets) */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-2 shadow-lg animate-fadeIn">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => handleNavClick('PROPERTIES')}
              className={`p-2.5 rounded-xl transition flex items-center gap-2 border ${
                currentView === 'PROPERTIES' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>AI Match</span>
            </button>

            <button
              onClick={() => handleNavClick('DEPOSITGUARD')}
              className={`p-2.5 rounded-xl transition flex items-center gap-2 border ${
                currentView === 'DEPOSITGUARD' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              <span>DepositGuard</span>
            </button>

            <button
              onClick={() => handleNavClick('MAINTENANCE')}
              className={`p-2.5 rounded-xl transition flex items-center gap-2 border ${
                currentView === 'MAINTENANCE' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <Wrench className="w-4 h-4 text-amber-600" />
              <span>AI Care</span>
            </button>

            <button
              onClick={() => handleNavClick('AGREEMENTS')}
              className={`p-2.5 rounded-xl transition flex items-center gap-2 border ${
                currentView === 'AGREEMENTS' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Agreements</span>
            </button>
          </div>

          <button
            onClick={() => handleNavClick('ADMIN')}
            className={`w-full p-2.5 rounded-xl transition flex items-center justify-center gap-2 border text-xs font-semibold ${
              currentView === 'ADMIN' ? 'bg-blue-50 border-blue-200 text-blue-700 font-bold' : 'border-slate-200 hover:bg-slate-50 text-slate-700'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Trust & Verification Portal</span>
          </button>

          {/* Role Switcher in Mobile Drawer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold uppercase text-slate-400">Switch Role:</span>
            <div className="flex space-x-1">
              {(['OWNER', 'TENANT', 'ADMIN'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    quickSwitchRole(r);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition ${
                    user?.role === r
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
