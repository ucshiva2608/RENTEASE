import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, Globe2, X, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { Language } from '../context/LanguageContext';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSearchTriggered?: (query: string) => void;
  onOpenOwnerCopilot?: () => void;
}

export const VoiceAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSearchTriggered,
  onOpenOwnerCopilot,
}) => {
  const [selectedLang, setSelectedLang] = useState<Language>('en');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [spokenResponse, setSpokenResponse] = useState<string>('');
  const [processing, setProcessing] = useState<boolean>(false);
  const [actionData, setActionData] = useState<any>(null);

  // Suggested voice prompts by language
  const suggestedPhrases: Record<Language, string[]> = {
    en: [
      'Find a furnished 2BHK in Hyderabad under ₹18,000 with parking',
      'Show my vacant properties',
      'How much rent did I collect this month?',
      'Open DepositGuard inspection reports',
    ],
    te: [
      'హైదరాబాద్‌లో 18000 లోపు 2BHK ఇల్లు కావాలి',
      'నా ఖాళీగా ఉన్న ఇళ్ల వివరాలు చూపించు',
      'డిపాజిట్‌గార్డ్ తనిఖీ నివేదికలు చూపించు',
    ],
    hi: [
      'मुझे हैदराबाद में 20000 के अंदर 2BHK फ्लैट चाहिए',
      'मेरी खाली संपत्तियां दिखाओ',
      'इस महीने कितना किराया जमा हुआ?',
    ],
  };

  // Web Speech Synthesis (Text to Speech)
  const speakText = (text: string, lang: Language) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (lang === 'te') utterance.lang = 'te-IN';
      else if (lang === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Web Speech Recognition (Speech to Text)
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;

        if (selectedLang === 'te') recognition.lang = 'te-IN';
        else if (selectedLang === 'hi') recognition.lang = 'hi-IN';
        else recognition.lang = 'en-IN';

        recognition.onstart = () => {
          setIsListening(true);
          setTranscript('Listening... Speak now into your microphone.');
        };

        recognition.onresult = (event: any) => {
          const spoken = event.results[0][0].transcript;
          setTranscript(spoken);
          setIsListening(false);
          handleVoiceSubmit(spoken);
        };

        recognition.onerror = () => {
          setIsListening(false);
          setTranscript('Microphone unavailable or permission denied. You can click any suggested phrase below.');
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.start();
      } catch (err) {
        setIsListening(false);
      }
    } else {
      setTranscript('Speech recognition not supported in this browser. Please click a suggested command.');
    }
  };

  const handleVoiceSubmit = async (queryText: string) => {
    if (!queryText.trim()) return;
    setProcessing(true);
    setSpokenResponse('');
    setActionData(null);

    try {
      const res = await api.queryVoiceAssistant(queryText, selectedLang);
      if (res.success && res.result) {
        const reply = res.result.spokenResponse;
        setSpokenResponse(reply);
        setActionData(res.result);
        speakText(reply, selectedLang);

        if (res.result.action === 'OPEN_OWNER_COPILOT' && onOpenOwnerCopilot) {
          setTimeout(() => {
            onClose();
            onOpenOwnerCopilot();
          }, 1500);
        } else if (res.result.action === 'NAVIGATE_TO_SEARCH' && onSearchTriggered) {
          setTimeout(() => {
            onClose();
            onSearchTriggered(queryText);
          }, 1500);
        }
      }
    } catch (err) {
      console.error(err);
      setSpokenResponse('Unable to process voice command at the moment.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
        {/* Header with Language Tabs */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-white/20 rounded-xl">
                <Sparkles className="w-5 h-5 text-amber-300" />
              </div>
              <h3 className="text-lg font-bold">Multilingual Voice Assistant</h3>
            </div>
            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Language Selection Pills */}
          <div className="flex space-x-2">
            {[
              { code: 'en', label: 'English', sub: 'Global' },
              { code: 'te', label: 'తెలుగు (Telugu)', sub: 'State Local' },
              { code: 'hi', label: 'हिन्दी (Hindi)', sub: 'National' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLang(lang.code as Language)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition border ${
                  selectedLang === lang.code
                    ? 'bg-white text-blue-900 border-white shadow-md'
                    : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Interaction Body */}
        <div className="p-6 text-center space-y-6">
          {/* Animated Microphone Button */}
          <div className="flex justify-center">
            <button
              onClick={toggleListening}
              className={`relative p-7 rounded-full shadow-xl transition transform hover:scale-105 active:scale-95 ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-200'
                  : 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white hover:shadow-blue-500/30'
              }`}
            >
              {isListening ? <Mic className="w-10 h-10 animate-bounce" /> : <Mic className="w-10 h-10" />}
              {isListening && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                </span>
              )}
            </button>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wider font-bold text-slate-400">
              {isListening ? 'Speak your query now' : 'Tap microphone to speak or click a phrase below'}
            </p>
            <p className="text-sm font-semibold text-slate-800 mt-2 min-h-[30px] italic">
              {transcript || 'e.g. "Find a furnished 2BHK in Hyderabad under ₹18,000"'}
            </p>
          </div>

          {/* Spoken Response Preview */}
          {spokenResponse && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-left flex items-start space-x-3">
              <Volume2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-blue-700 uppercase">Voice AI Assistant:</span>
                <p className="text-sm text-slate-800 font-medium mt-0.5">{spokenResponse}</p>
              </div>
            </div>
          )}

          {/* Quick Voice Chips */}
          <div className="space-y-2 text-left pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Sample Voice Queries ({selectedLang.toUpperCase()}):
            </span>
            <div className="space-y-1.5">
              {suggestedPhrases[selectedLang].map((phrase, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setTranscript(phrase);
                    handleVoiceSubmit(phrase);
                  }}
                  className="w-full text-left text-xs p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200 hover:border-blue-300 transition flex items-center justify-between group"
                >
                  <span>"{phrase}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
