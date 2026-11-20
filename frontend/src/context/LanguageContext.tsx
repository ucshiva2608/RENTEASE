import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'te' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    appTitle: 'RentEase',
    appTagline: 'Intelligent, Trust-Focused Rental Ecosystem',
    navProperties: 'Properties',
    navDepositGuard: 'DepositGuard',
    navAICare: 'AI Care Maintenance',
    navAgreements: 'Agreements',
    navOwnerCopilot: 'Owner Copilot',
    navAdmin: 'Verification Portal',
    searchPlaceholder: 'e.g. Find a furnished 2BHK in Hyderabad under ₹18,000 with parking',
    voiceSearch: 'Voice Assistant',
    trustVerified: 'Trust Verified',
    verifiedProperty: 'Verified Property',
    viewDetails: 'View Details',
    monthlyRent: 'Monthly Rent',
    securityDeposit: 'Security Deposit',
    bedrooms: 'Bedrooms',
    bathrooms: 'Baths',
    furnishing: 'Furnishing',
    amenities: 'Amenities',
  },
  te: {
    appTitle: 'రెంట్ ఈజ్ (RentEase)',
    appTagline: 'నమ్మకమైన & స్మార్ట్ ఇళ్ల అద్దె వ్యవస్థ',
    navProperties: 'ఇళ్ల వివరాలు',
    navDepositGuard: 'డిపాజిట్‌గార్డ్',
    navAICare: 'ఏఐ కేర్ రిపేర్లు',
    navAgreements: 'అద్దె ఒప్పందాలు',
    navOwnerCopilot: 'ఓనర్ కోపైలట్',
    navAdmin: 'వెరిఫికేషన్ పోర్టల్',
    searchPlaceholder: 'ఉదాహరణ: హైదరాబాద్‌లో 18000 లోపు 2BHK ఫర్నిష్డ్ ఇల్లు',
    voiceSearch: 'వాయిస్ అసిస్టెంట్ (మాట్లాడండి)',
    trustVerified: 'పూర్తిగా ధృవీకరించబడింది',
    verifiedProperty: 'ధృవీకరించబడిన ఇల్లు',
    viewDetails: 'పూర్తి వివరాలు చూడండి',
    monthlyRent: 'నెలవారీ అద్దె',
    securityDeposit: 'సెక్యూరిటీ డిపాజిట్',
    bedrooms: 'గదులు (బెడ్‌రూమ్స్)',
    bathrooms: 'బాత్‌రూమ్‌లు',
    furnishing: 'ఫర్నిషింగ్',
    amenities: 'సౌకర్యాలు',
  },
  hi: {
    appTitle: 'रेंट ईज़ (RentEase)',
    appTagline: 'स्मार्ट और विश्वसनीय मकान किराया प्लेटफॉर्म',
    navProperties: 'प्रॉपर्टीज',
    navDepositGuard: 'डिपॉजिटगार्ड',
    navAICare: 'एआई केयर मरम्मत',
    navAgreements: 'किराया अनुबंध',
    navOwnerCopilot: 'ओनर कोपायलट',
    navAdmin: 'सत्यापन पोर्टल',
    searchPlaceholder: 'जैसे: हैदराबाद में 18,000 के अंदर 2BHK फ्लैट पार्किंग के साथ',
    voiceSearch: 'वॉयस असिस्टेंट (बोलकर खोजें)',
    trustVerified: 'सत्यापित प्रॉपर्टी',
    verifiedProperty: 'वेरिफाइड प्रॉपर्टी',
    viewDetails: 'विवरण देखें',
    monthlyRent: 'मासिक किराया',
    securityDeposit: 'सिक्योरिटी डिपॉजिट',
    bedrooms: 'कमरे',
    bathrooms: 'बाथरूम',
    furnishing: 'फर्नीचर',
    amenities: 'सुविधाएं',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
