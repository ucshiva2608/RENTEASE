import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PropertiesPage } from './pages/PropertiesPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { DepositGuardPage } from './pages/DepositGuardPage';
import { MaintenancePage } from './pages/MaintenancePage';
import { AgreementsPage } from './pages/AgreementsPage';
import { AdminVerificationPage } from './pages/AdminVerificationPage';

import { VerificationBadgeModal } from './components/VerificationBadgeModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { OwnerCopilotDrawer } from './components/OwnerCopilotDrawer';
import { NeighborhoodMapModal } from './components/NeighborhoodMapModal';
import { AgreementAnalyzerModal } from './components/AgreementAnalyzerModal';
import { MaintenanceModal } from './components/MaintenanceModal';
import { DepositGuardModal } from './components/DepositGuardModal';

import { Property, AIMatchResult } from './types';
import { api } from './services/api';

function MainApp() {
  const [currentView, setCurrentView] = useState<string>('HOME');
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Search and AI Match State
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>('');
  const [aiMatchResults, setAiMatchResults] = useState<AIMatchResult[] | null>(null);

  // Modal States
  const [trustModalPropertyId, setTrustModalPropertyId] = useState<string | null>(null);
  const [neighborhoodPropertyId, setNeighborhoodPropertyId] = useState<string | null>(null);
  const [agreementPropertyId, setAgreementPropertyId] = useState<string | null>(null);
  const [maintenancePropertyId, setMaintenancePropertyId] = useState<string | null>(null);
  const [depositModalRecordId, setDepositModalRecordId] = useState<string | null>(null);

  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isOwnerCopilotOpen, setIsOwnerCopilotOpen] = useState<boolean>(false);

  // Load Properties from backend
  const loadProperties = async () => {
    try {
      const res = await api.getProperties();
      if (res.success && res.properties) {
        setProperties(res.properties);
      }
    } catch (err) {
      console.error('Failed to fetch properties:', err);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  // Handle Natural Language Search (Module 2)
  const handleSearch = async (query: string) => {
    setCurrentSearchQuery(query);
    setCurrentView('PROPERTIES');
    try {
      const res = await api.aiMatchSearch(query);
      if (res.success && res.results) {
        setAiMatchResults(res.results);
      }
    } catch (err) {
      console.error('AI match search error:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'PROPERTIES' && !aiMatchResults) {
            setAiMatchResults(null);
          }
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenOwnerCopilot={() => setIsOwnerCopilotOpen(true)}
      />

      <main className="flex-1">
        {currentView === 'HOME' && (
          <HomePage
            properties={properties}
            onSearch={handleSearch}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenOwnerCopilot={() => setIsOwnerCopilotOpen(true)}
            onSelectProperty={(prop) => {
              setSelectedProperty(prop);
              setCurrentView('DETAIL');
            }}
            onOpenTrustBadge={(id) => setTrustModalPropertyId(id)}
            onOpenNeighborhood={(id) => setNeighborhoodPropertyId(id)}
            onNavigate={(v) => setCurrentView(v)}
          />
        )}

        {currentView === 'PROPERTIES' && (
          <PropertiesPage
            properties={properties}
            aiMatchResults={aiMatchResults}
            currentSearchQuery={currentSearchQuery}
            onSearch={handleSearch}
            onOpenVoice={() => setIsVoiceOpen(true)}
            onOpenTrustBadge={(id) => setTrustModalPropertyId(id)}
            onOpenNeighborhood={(id) => setNeighborhoodPropertyId(id)}
            onOpenAgreementAnalyzer={(id) => setAgreementPropertyId(id)}
            onOpenMaintenanceModal={(id) => setMaintenancePropertyId(id)}
            onSelectProperty={(prop) => {
              setSelectedProperty(prop);
              setCurrentView('DETAIL');
            }}
          />
        )}

        {currentView === 'DETAIL' && selectedProperty && (
          <PropertyDetailPage
            property={selectedProperty}
            onBack={() => setCurrentView('PROPERTIES')}
            onOpenTrustBadge={(id) => setTrustModalPropertyId(id)}
            onOpenNeighborhood={(id) => setNeighborhoodPropertyId(id)}
            onOpenAgreementAnalyzer={(id) => setAgreementPropertyId(id)}
            onOpenMaintenanceModal={(id) => setMaintenancePropertyId(id)}
          />
        )}

        {currentView === 'DEPOSITGUARD' && (
          <DepositGuardPage properties={properties} />
        )}

        {currentView === 'MAINTENANCE' && (
          <MaintenancePage properties={properties} />
        )}

        {currentView === 'AGREEMENTS' && (
          <AgreementsPage properties={properties} />
        )}

        {currentView === 'ADMIN' && (
          <AdminVerificationPage />
        )}
      </main>

      <Footer />

      {/* Global Modals */}
      {trustModalPropertyId && (
        <VerificationBadgeModal
          propertyId={trustModalPropertyId}
          onClose={() => setTrustModalPropertyId(null)}
        />
      )}

      {neighborhoodPropertyId && (
        <NeighborhoodMapModal
          propertyId={neighborhoodPropertyId}
          onClose={() => setNeighborhoodPropertyId(null)}
        />
      )}

      {agreementPropertyId && (
        <AgreementAnalyzerModal
          propertyId={agreementPropertyId}
          onClose={() => setAgreementPropertyId(null)}
        />
      )}

      {maintenancePropertyId && (
        <MaintenanceModal
          propertyId={maintenancePropertyId}
          onClose={() => setMaintenancePropertyId(null)}
          onTicketCreated={loadProperties}
        />
      )}

      {depositModalRecordId && (
        <DepositGuardModal
          depositRecordId={depositModalRecordId}
          onClose={() => setDepositModalRecordId(null)}
        />
      )}

      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSearchTriggered={(query) => handleSearch(query)}
        onOpenOwnerCopilot={() => setIsOwnerCopilotOpen(true)}
      />

      <OwnerCopilotDrawer
        isOpen={isOwnerCopilotOpen}
        onClose={() => setIsOwnerCopilotOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
