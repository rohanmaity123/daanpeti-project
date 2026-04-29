/**
 * ============================================================
 *  DoctorFinderPage.jsx  —  DaanGuru AI Doctor Finder
 *  WITH react-speech-recognition PLUGIN
 *  
 *  INSTALL: npm install react-speech-recognition
 * ============================================================
 */

import { useState, useCallback, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import {
  Mic, MicOff, Search, MapPin, Phone, Star, Clock,
  Stethoscope, Pill, AlertCircle, ChevronDown, X,
  Loader2, Sparkles, ToggleLeft, ToggleRight, Bot, Zap
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { askLLM, askLLMStream } from '../../utils/askLlm';
import { set } from 'react-hook-form';

// ─── SYMPTOM → SPECIALTY MAP ──────────────────────────────────────────────────
const SYMPTOM_MAP = [
  {
    keywords: ['fever', 'cold', 'cough', 'headache', 'weakness', 'body pain', 'flu', 'viral', 'infection', 'stomach', 'diarrhea', 'vomiting', 'diabetes', 'bp', 'blood pressure', 'bukhaar', 'sar dard', 'pet dard'],
    specialty: 'General Physician', urgency: 'low',
  },
  {
    keywords: ['periods', 'pregnancy', 'uterus', 'pcod', 'pcos', 'white discharge', 'infertility', 'menstrual', 'gynaec', 'delivery', 'garbh', 'mahavari'],
    specialty: 'Gynecologist', urgency: 'medium',
  },
  {
    keywords: ['child', 'baby', 'infant', 'kids', 'newborn', 'vaccination', 'growth', 'bacha', 'bacche', 'shishu'],
    specialty: 'Pediatrician', urgency: 'low',
  },
  {
    keywords: ['bone', 'joint', 'knee', 'back pain', 'spine', 'fracture', 'arthritis', 'ligament', 'shoulder', 'haddi', 'ghutna'],
    specialty: 'Orthopedic', urgency: 'medium',
  },
  {
    keywords: ['skin', 'rash', 'acne', 'pimple', 'allergy', 'itching', 'eczema', 'fungal', 'hair loss', 'chamdi', 'kharish'],
    specialty: 'Dermatologist', urgency: 'low',
  },
  {
    keywords: ['heart', 'chest pain', 'palpitation', 'shortness of breath', 'cardiac', 'cholesterol', 'dil', 'seene mein dard'],
    specialty: 'Cardiologist', urgency: 'high',
  },
  {
    keywords: ['tooth', 'teeth', 'gum', 'cavity', 'dental', 'root canal', 'toothache', 'daant', 'dant'],
    specialty: 'Dentist', urgency: 'low',
  },
  {
    keywords: ['ear', 'nose', 'throat', 'hearing', 'tonsil', 'sinusitis', 'nasal', 'vertigo', 'snoring', 'kaan', 'naak', 'gala'],
    specialty: 'ENT Specialist', urgency: 'low',
  },
  {
    keywords: ['lung', 'asthma', 'breathing', 'tb', 'tuberculosis', 'pneumonia', 'bronchitis', 'saans', 'khasi'],
    specialty: 'Pulmonologist', urgency: 'medium',
  },
  {
    keywords: ['eye', 'vision', 'cataract', 'glasses', 'spectacles', 'blur', 'red eye', 'glaucoma', 'aankh', 'nazar'],
    specialty: 'Ophthalmologist', urgency: 'low',
  },
  {
    keywords: ['surgery', 'hernia', 'gallstone', 'appendix', 'piles', 'fissure', 'tumor', 'operation'],
    specialty: 'General Surgeon', urgency: 'medium',
  },
];

// ─── LOCAL SYMPTOM MATCHER ────────────────────────────────────────────────────
function matchSpecialtyLocally(text) {
  const lower = text.toLowerCase();
  for (const entry of SYMPTOM_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return { specialty: entry.specialty, urgency: entry.urgency };
    }
  }
  return { specialty: 'General Physician', urgency: 'low' };
}

// ─── LOCAL RESULT BUILDER ─────────────────────────────────────────────────────
function buildLocalResult(symptomText) {
  const { specialty, urgency } = matchSpecialtyLocally(symptomText);
  const adviceMap = {
    high: 'Please visit a doctor or emergency room immediately.',
    medium: 'Book an appointment within the next 1-2 days.',
    low: 'Schedule a consultation at your earliest convenience.',
  };
  return {
    specialty,
    urgency,
    summary: `Based on your symptoms, a ${specialty} can best help you.`,
    medicines: [],
    advice: adviceMap[urgency],
    source: 'local',
  };
}

// ─── CLAUDE AI CALL ───────────────────────────────────────────────────────────
async function callClaudeAI(symptomText, city) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('No API key');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: `You are a medical assistant for India. Return ONLY valid JSON (no markdown):
{
  "specialty": "one of: General Physician, Gynecologist, Pediatrician, Orthopedic, Dermatologist, Cardiologist, Dentist, ENT Specialist, Pulmonologist, Ophthalmologist, General Surgeon",
  "urgency": "low or medium or high",
  "summary": "1 sentence in simple English",
  "medicines": ["safe OTC medicine if applicable"],
  "advice": "1 practical tip before seeing doctor"
}
Keep under 120 words. Only suggest very safe OTC medicines.`,
      messages: [{ role: 'user', content: `Patient in ${city}, India: "${symptomText}"` }],
    }),
  });

  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  const text = data.content?.[0]?.text || '{}';
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim());
  return { ...parsed, source: 'claude' };
}

// ─── SPECIALTY ALIASES ────────────────────────────────────────────────────────
const SPECIALTY_ALIASES = {
  'General Physician': ['general physician', 'general-physician', 'physician', 'internal medicine specialist', 'general practitioner', 'doctor', 'medical clinic', 'clinic'],
  'Gynecologist': ['gynecologist', 'gynaecologist', 'obstetrician', 'obstetrician-gynecologist'],
  'Pediatrician': ['pediatrician', 'paediatrician', 'child specialist', 'neonatal physician'],
  'Orthopedic': ['orthopedic', 'orthopaedic', 'orthopedic clinic', 'orthopedic surgeon'],
  'Dermatologist': ['dermatologist', 'skin care clinic', 'skin'],
  'Cardiologist': ['cardiologist', 'cardiac', 'cardio'],
  'Dentist': ['dentist', 'dental clinic', 'orthodontic'],
  'ENT Specialist': ['ent specialist', 'otolaryngology', 'ear nose throat'],
  'Pulmonologist': ['pulmonologist', 'respiratory'],
  'Ophthalmologist': ['ophthalmologist', 'eye', 'vision'],
  'General Surgeon': ['general surgeon', 'surgeon', 'surgery'],
};

function matchesSpecialty(doctorSpecialty, targetSpecialty) {
  const ds = (doctorSpecialty || '').toLowerCase();
  const aliases = SPECIALTY_ALIASES[targetSpecialty] || [targetSpecialty.toLowerCase()];
  return aliases.some(alias => ds.includes(alias));
}

// ─── DOCTOR CARD ──────────────────────────────────────────────────────────────
function DoctorCard({ doctor, index }) {
  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const todayHours = (doctor.hours || []).filter(h => !h.closed).find(h => h.day?.includes(todayName));

  return (
    <div
      className="glass-card rounded-2xl p-4 border border-white/10 hover:border-[#8EF0CC]/30 transition-all"
      style={{ animationDelay: `${index * 80}ms`, animation: 'fadeSlideUp 0.4s ease both' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
            style={{ background: 'rgba(29,158,117,0.2)', border: '1px solid rgba(29,158,117,0.4)' }}>
            🩺
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{doctor.name}</p>
            <p className="text-xs text-[#8EF0CC]/80 mt-0.5">{doctor.specialty}</p>
          </div>
        </div>
        {doctor.rating && (
          <div className="flex items-center gap-1 shrink-0 px-2 py-1 rounded-lg"
            style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-bold text-yellow-400">{doctor.rating}</span>
            {doctor.reviews && <span className="text-xs text-white/40">({doctor.reviews})</span>}
          </div>
        )}
      </div>

      <div className="space-y-1.5">
        {doctor.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3.5 h-3.5 text-white/40 mt-0.5 shrink-0" />
            <p className="text-xs text-white/60 leading-relaxed">{doctor.address}</p>
          </div>
        )}
        {doctor.phone && (
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <a href={`tel:${doctor.phone}`} className="text-xs text-[#8EF0CC] hover:text-white transition-colors font-medium">
              {doctor.phone}
            </a>
          </div>
        )}
        {(todayHours || doctor.timings) && (
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <p className="text-xs text-white/60">
              {todayHours ? `Today: ${todayHours.raw?.split(':').slice(1).join(':').trim() || 'Open'}` : doctor.timings}
            </p>
          </div>
        )}
        {doctor.experience && (
          <div className="flex items-center gap-2">
            <Stethoscope className="w-3.5 h-3.5 text-white/40 shrink-0" />
            <p className="text-xs text-white/60">{doctor.experience}</p>
          </div>
        )}
        {doctor.fees && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/40 font-bold ml-0.5">₹</span>
            <p className="text-xs text-white/60">Fees: ₹{doctor.fees}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        {doctor.phone && (
          <a href={`tel:${doctor.phone}`}
            className="flex-1 text-center py-2 rounded-xl text-xs font-bold text-white transition-all hover:-translate-y-0.5"
            style={{ background: 'linear-gradient(135deg,#1D9E75,#0f6e56)', boxShadow: '0 3px 12px rgba(29,158,117,0.3)' }}>
            📞 Call Now
          </a>
        )}
        {doctor.maps_url && (
          <a href={doctor.maps_url} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
            🗺️ Maps
          </a>
        )}
        {doctor.profile_url && (
          <a href={doctor.profile_url} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}>
            👤 Profile
          </a>
        )}
      </div>
    </div>
  );
}

// ─── AI RESULT CARD ───────────────────────────────────────────────────────────
function AIResultCard({ result }) {
  const urgencyConfig = {
    high: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', label: '🚨 Urgent', text: 'See a doctor immediately' },
    medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', label: '⚠️ Moderate', text: 'See a doctor within 1-2 days' },
    low: { color: '#1D9E75', bg: 'rgba(29,158,117,0.15)', border: 'rgba(29,158,117,0.3)', label: '✅ Routine', text: 'Schedule an appointment soon' },
  };
  const u = urgencyConfig[result.urgency] || urgencyConfig.low;

  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(142,240,204,0.15)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: u.bg, border: `1px solid ${u.border}`, color: u.color }}>
          {u.label}
        </span>
        <div className="flex items-center gap-1.5">
          {result.source === 'claude' ? (
            <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc' }}>
              <Sparkles className="w-3 h-3" /> Claude AI
            </span>
          ) : (
            <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)', color: '#8EF0CC' }}>
              <Zap className="w-3 h-3" /> Local Match
            </span>
          )}
          <span className="text-xs text-white/50">{u.text}</span>
        </div>
      </div>

      {result.summary && (
        <p className="text-sm text-white/80 leading-relaxed mb-3">{result.summary}</p>
      )}

      <div className="flex items-center gap-2 p-2.5 rounded-xl mb-3"
        style={{ background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)' }}>
        <Stethoscope className="w-4 h-4 text-[#8EF0CC]" />
        <div>
          <p className="text-xs text-[#8EF0CC]/70">Recommended Doctor</p>
          <p className="text-sm font-bold text-white">{result.specialty}</p>
        </div>
      </div>

      {result.medicines?.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Pill className="w-3.5 h-3.5 text-white/50" />
            <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">OTC Medicines (Safe to Try)</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {result.medicines.map((m, i) => (
              <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-medium"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)' }}>
                💊 {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {result.advice && (
        <div className="flex gap-2 p-2.5 rounded-xl text-xs text-white/65 leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-yellow-400" />
          {result.advice}
        </div>
      )}

      <p className="text-xs text-white/30 mt-3 text-center">⚠️ Suggestion only. Always consult a qualified doctor.</p>
    </div>
  );
}

// ─── CLAUDE TOGGLE ────────────────────────────────────────────────────────────
function ClaudeToggle({ enabled, onToggle }) {
  const hasKey = !!import.meta.env.VITE_ANTHROPIC_API_KEY;

  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-2xl mb-4"
      style={{ background: 'rgba(99,102,241,0.08)', border: `1px solid ${enabled ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`, transition: 'border-color 0.3s' }}>
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: enabled ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.06)', transition: 'background 0.3s' }}>
          <Bot className="w-4 h-4" style={{ color: enabled ? '#a5b4fc' : 'rgba(255,255,255,0.4)' }} />
        </div>
        <div>
          <p className="text-xs font-bold text-white">Claude AI Analysis</p>
          <p className="text-xs text-white/45">
            {!hasKey ? '⚠️ Add API key to enable' : enabled ? 'Smarter symptom detection' : 'Using local matching'}
          </p>
        </div>
      </div>
      <button
        onClick={() => hasKey && onToggle(!enabled)}
        className="transition-all"
        style={{ opacity: hasKey ? 1 : 0.4, cursor: hasKey ? 'pointer' : 'not-allowed' }}
        title={!hasKey ? 'Add VITE_ANTHROPIC_API_KEY to .env to enable' : ''}
      >
        {enabled
          ? <ToggleRight className="w-8 h-8" style={{ color: '#a5b4fc' }} />
          : <ToggleLeft className="w-8 h-8 text-white/30" />
        }
      </button>
    </div>
  );
}
function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSlowConnection, setIsSlowConnection] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection speed
    const checkSpeed = async () => {
      if (!navigator.onLine) {
        setIsSlowConnection(true);
        return;
      }

      try {
        const start = performance.now();
        const response = await fetch('/ping', { method: 'HEAD' });
        const end = performance.now();
        const latency = end - start;

        // If latency > 2000ms, consider it slow
        setIsSlowConnection(latency > 2000 || !response.ok);
      } catch {
        setIsSlowConnection(true);
      }
    };

    checkSpeed();
    const interval = setInterval(checkSpeed, 30000); // Check every 30s

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { isOnline, isSlowConnection };
}
function useSpeechRecognitionWithRetry() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const startListening = useCallback(async (lang = 'en-IN') => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('❌ Speech Recognition not supported in this browser');
      return;
    }

    if (!navigator.onLine) {
      setError('❌ No internet connection. Please check your network.');
      return;
    }

    try {
      setError('');
      setListening(true);
      setTranscript('');

      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      // ✅ TIMEOUT HANDLER (avoid hanging)
      const timeoutId = setTimeout(() => {
        recognition.abort();
        setListening(false);
        setError('⏱️ Speech recognition timed out. Please try again.');
      }, 15000);

      recognition.onstart = () => {
        setError('');
        setListening(true);
      };

      recognition.onresult = (e) => {
        clearTimeout(timeoutId);
        const transcript = Array.from(e.results)
          .map(r => r[0].transcript)
          .join('');
        setTranscript(transcript);
      };

      recognition.onerror = (e) => {
        clearTimeout(timeoutId);
        setListening(false);

        let errorMsg = '';
        let shouldRetry = false;

        switch (e.error) {
          case 'network':
            errorMsg = '❌ Network error detected. ';
            if (retryCount < MAX_RETRIES) {
              errorMsg += `Retrying... (${retryCount + 1}/${MAX_RETRIES})`;
              shouldRetry = true;
            } else {
              errorMsg += `Please check your internet speed and try again.`;
            }
            break;

          case 'no-speech':
            errorMsg = '❌ No speech detected. Please speak clearly into the microphone.';
            break;

          case 'not-allowed':
            errorMsg = '❌ Microphone permission denied. Check browser settings.';
            break;

          case 'audio-capture':
            errorMsg = '❌ No microphone detected or access denied.';
            break;

          case 'service-not-allowed':
            errorMsg = '❌ Speech Recognition service disabled. Try another browser.';
            break;

          default:
            errorMsg = `❌ Error: ${e.error}. Please try again.`;
        }

        setError(errorMsg);

        // ✅ RETRY LOGIC
        if (shouldRetry) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            startListening(lang);
          }, 1000 * (retryCount + 1)); // Exponential backoff
        } else {
          setRetryCount(0);
        }
      };

      recognition.onend = () => {
        clearTimeout(timeoutId);
        setListening(false);
      };

      recognition.start();
    } catch (err) {
      setError(`❌ Error: ${err.message}`);
      setListening(false);
    }
  }, [retryCount]);

  const stopListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.abort();
    }
    setListening(false);
    setRetryCount(0);
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError('');
    setRetryCount(0);
  }, []);

  return { transcript, listening, error, startListening, stopListening, resetTranscript };
}
// ─── NETWORK STATUS BANNER ───────────────────────────────────────────────────
function NetworkStatusBanner({ isOnline, isSlowConnection }) {
  if (!isOnline) {
    return (
      <div className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white flex items-center gap-2 mb-4"
        style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)' }}>
        <WifiOff className="w-4 h-4" />
        <span>📡 No internet connection. Microphone features disabled.</span>
      </div>
    );
  }

  if (isSlowConnection) {
    return (
      <div className="w-full px-4 py-3 rounded-xl text-sm font-medium text-white flex items-center gap-2 mb-4"
        style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)' }}>
        <Wifi className="w-4 h-4" />
        <span>⚠️ Slow connection detected. Speech recognition may fail. Try typing instead.</span>
      </div>
    );
  }

  return null;
}

// ─── TROUBLESHOOTING COMPONENT ───────────────────────────────────────────────
function TroubleshootingSuggestionsModal({ show, onClose }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 backdrop-blur-sm">
      <div className="w-full max-h-[80vh] overflow-y-auto rounded-3xl rounded-b-none p-6"
        style={{ background: 'rgba(15,32,39,0.98)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">🔧 Fix Network Error</h2>
          <button onClick={onClose} className="text-white/50 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Check Internet */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-sm font-bold text-white mb-2">1️⃣ Check Internet Connection</p>
            <ul className="text-xs text-white/70 space-y-1 ml-3">
              <li>✓ Use WiFi (not mobile hotspot)</li>
              <li>✓ Run a speed test: speedtest.net</li>
              <li>✓ Minimum 1 Mbps required</li>
              <li>✓ Restart your router</li>
            </ul>
          </div>

          {/* Browser */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-sm font-bold text-white mb-2">2️⃣ Use Supported Browser</p>
            <ul className="text-xs text-white/70 space-y-1 ml-3">
              <li>✓ Google Chrome (best support)</li>
              <li>✓ Microsoft Edge</li>
              <li>✓ Safari (macOS/iOS 14.5+)</li>
              <li>✓ Firefox (limited support)</li>
            </ul>
          </div>

          {/* Permissions */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-sm font-bold text-white mb-2">3️⃣ Grant Microphone Permission</p>
            <p className="text-xs text-white/70 mb-2">
              When browser asks "Allow microphone access?", click <strong>Allow</strong>
            </p>
            <div className="text-xs text-white/50 space-y-1">
              <p><strong>Chrome:</strong> Settings → Privacy → Microphone → Allow</p>
              <p><strong>Firefox:</strong> Preferences → Privacy → Microphone → Allow</p>
              <p><strong>Safari:</strong> System Preferences → Security & Privacy → Microphone</p>
            </div>
          </div>

          {/* Workaround */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-sm font-bold text-white mb-2">4️⃣ Quick Workaround</p>
            <p className="text-xs text-white/70">
              👉 <strong>Type your symptoms instead of using mic</strong> - it works just as well!
            </p>
          </div>

          {/* Advanced */}
          <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-sm font-bold text-white mb-2">5️⃣ Still Having Issues?</p>
            <ul className="text-xs text-white/70 space-y-1 ml-3">
              <li>• Clear browser cache & cookies</li>
              <li>• Update your browser to latest version</li>
              <li>• Try in Incognito/Private window</li>
              <li>• Disable browser extensions</li>
              <li>• Try a different WiFi network</li>
            </ul>
          </div>
        </div>

        <button onClick={onClose}
          className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#1D9E75,#0f6e56)' }}>
          Got it! 👍
        </button>
      </div>
    </div>
  );
}

// ─── UPDATED MIC BUTTON WITH TROUBLESHOOTING ───────────────────────────────
export function MicButton({ listening, error, onStart, onStop, isOnline, disabled = false }) {
  const [showHelp, setShowHelp] = useState(false);

  return (
    <>
      <div className="relative">
        <button
          onClick={listening ? onStop : onStart}
          disabled={disabled || !isOnline}
          className="relative w-14 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: listening ? 'rgba(239,68,68,0.25)' : 'rgba(29,158,117,0.2)',
            border: `1px solid ${listening ? 'rgba(239,68,68,0.5)' : 'rgba(29,158,117,0.5)'}`,
          }}>
          {listening && <span className="mic-pulse absolute inset-0 rounded-xl" />}
          {listening
            ? <MicOff className="w-5 h-5 text-red-400 relative z-10" />
            : <Mic className="w-5 h-5 text-[#8EF0CC] relative z-10" />
          }
        </button>

        {/* Help Icon */}
        {error && (
          <button
            onClick={() => setShowHelp(true)}
            className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-red-400 hover:text-red-300 font-bold whitespace-nowrap"
            title="Show troubleshooting guide">
            Need help? 🔧
          </button>
        )}
      </div>

      <TroubleshootingSuggestionsModal show={showHelp} onClose={() => setShowHelp(false)} />
    </>
  );
}
// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DoctorFinderPage() {
  const [symptomText, setSymptomText] = useState('');
  const [selectedCity, setSelectedCity] = useState('jhargram');
  const [selectedLang, setSelectedLang] = useState('en-IN');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [useClaudeAI, setUseClaudeAI] = useState(false);
  const [chat, setChat] = useState('');
  const { isOnline, isSlowConnection } = useNetworkStatus();


  // ✅ USE REACT-SPEECH-RECOGNITION HOOK
  const {
    transcript,
    listening,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognitionWithRetry();

  useEffect(() => {
    fetch('/doctors_master.json')
      .then(r => r.json())
      .then(data => setAllDoctors(data))
      .catch(() => setAllDoctors([]));
  }, []);

  const cities = [...new Set(allDoctors.map(d => d.city).filter(Boolean))].sort();

  // ✅ UPDATE symptomText when transcript changes
  useEffect(() => {
    if (transcript) {
      setSymptomText(transcript);
    }
  }, [transcript]);

  // ─── SEARCH ────────────────────────────────────────────────────────────────
  const extractData = async (userText) => {
    const prompt = `
      User input: "${symptomText}"

      Extract:
      - illness
      - budget (in INR)
      - intent

      Respond ONLY in JSON:
      {
        "illness": "",
        "budget": number,
        "intent": ""
      }
      `;

    const res = await askLLM(prompt);

    try {
      return JSON.parse(res);
    } catch {
      return { illness: null, budget: null };
    }
  };

  const getReply = async (illness, budget) => {
    try {
      const prompt = `You are a helpful doctor in India speaking Hinglish.

User is poor in India, budget ₹${budget}, suffering from ${illness}.

IMPORTANT: Format your response with line breaks and numbers like this:
1. Simple home remedy
2. Cheapest doctor suggestion  
3. Reassurance message

Keep it under 3 sentences per point. Use line breaks between each point.
Language: Hinglish (Hindi + English mix)
`;
      // askLLMStream returns complete text when no callback is provided
      const reply = await askLLMStream(prompt);
      console.log('Reply from askLLMStream:', reply);

      return typeof reply === 'string' ? reply.trim() : 'Kripaya dobara koshish karein. (Please try again)';
    } catch (err) {
      console.error('getReply error:', err);
      return 'Kripaya dobara koshish karein. (Please try again)';
    }
  };

  const streamText = async (text) => {
    return new Promise((resolve) => {
      if (!text) {
        console.warn('streamText: No text provided');
        resolve();
        return;
      }

      setChat('');
      let current = '';
      const textStr = String(text);

      const streamInterval = setInterval(() => {
        if (current.length < textStr.length) {
          current = textStr.slice(0, current.length + 1);
          setChat(current);
        } else {
          clearInterval(streamInterval);
          resolve();
        }
      }, 15);
    });
  };

  const handleQuery = async (input) => {
    try {
      setIsLoading(true);
      setError('');
      setChat('');
      setDoctors([]);

      if (!input.trim()) {
        setError('Kripaya apne symptoms batayein.');
        setIsLoading(false);
        return;
      }

      const { illness, budget } = await extractData(input);

      if (!illness) {
        setError('Samajh nahi aaya. Dobara koshish karein.');
        setIsLoading(false);
        return;
      }

      // Get AI reply
      const reply = await getReply(illness, budget);
      console.log('Reply received:', reply);

      // Stream the reply
      await streamText(reply);

      // ✅ NOW SEARCH FOR MATCHING DOCTORS
      const { specialty, urgency } = matchSpecialtyLocally(input);
      console.log('Detected specialty:', specialty, 'Urgency:', urgency);

      // Filter doctors by city and specialty
      const matchedDoctors = allDoctors.filter(doctor => {
        const cityMatch = doctor.city?.toLowerCase() === selectedCity.toLowerCase();
        const specialtyMatch = matchesSpecialty(doctor.specialty, specialty);
        return cityMatch && specialtyMatch;
      });

      console.log(`Found ${matchedDoctors.length} doctors in ${selectedCity} for ${specialty}`);

      // Set doctors to display
      setDoctors(matchedDoctors.slice(0, 6)); // Limit to 6 doctors

      // Create AI result card data
      const aiResultData = {
        specialty,
        urgency,
        summary: `Based on your symptoms, a ${specialty} can best help you.`,
        medicines: [],
        advice: {
          high: 'Please visit a doctor or emergency room immediately.',
          medium: 'Book an appointment within the next 1-2 days.',
          low: 'Schedule a consultation at your earliest convenience.',
        }[urgency],
        source: 'local',
      };

      setAiResult(aiResultData);
      setStep(3); // Show results
    } catch (err) {
      console.error('handleQuery error:', err);
      setError('Kuch galat hua. Dobara koshish karein.');
    } finally {
      setIsLoading(false);
    }
  };
  const handleReset = () => {
    setSymptomText('');
    setAiResult(null);
    setDoctors([]);
    setStep(0);
    setError('');
    resetTranscript();
    setChat('');
  };

  const QUICK_SYMPTOMS = [
    { label: '🤒 Fever', text: 'I have high fever with body pain and headache for 2 days' },
    { label: '🤢 Stomach', text: 'Stomach pain, vomiting and loose motions since morning' },
    { label: '💔 Chest', text: 'Chest pain and shortness of breath' },
    { label: '🦷 Tooth', text: 'Severe toothache and swollen gum' },
    { label: '👶 Child Sick', text: 'My child has fever and is not eating anything' },
    { label: '🩸 Periods', text: 'Irregular periods and stomach cramps with white discharge' },
  ];

  return (
    <>
      <Helmet>
        <title>AI Doctor Finder — DaanGuru</title>
        <meta name="description" content="Describe your symptoms in any Indian language. Find nearby doctors instantly." />
      </Helmet>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { transform:scale(1);   opacity:0.6; }
          100% { transform:scale(2.2); opacity:0; }
        }
        .mic-pulse::before {
          content:''; position:absolute; inset:0; border-radius:50%;
          background:rgba(29,158,117,0.4);
          animation:pulse-ring 1.2s ease-out infinite;
        }
        @keyframes float {
          from { transform:translateY(0px) rotate(0deg); }
          to   { transform:translateY(-12px) rotate(8deg); }
        }
      `}</style>

      <div className="min-h-screen pb-16">
        <div className="mx-4 pt-6 lg:mx-auto lg:max-w-[680px]">

          {/* ── HERO ──────────────────────────────────────────── */}
          <div className="rounded-3xl p-6 relative overflow-hidden mb-4"
            style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(20px)', border: '1px solid rgba(142,240,204,0.18)' }}>
            {['🩺', '💊', '🏥', '❤️'].map((e, i) => (
              <span key={i} className="absolute text-2xl pointer-events-none opacity-10 select-none"
                style={{ top: `${[15, 65, 20, 70][i]}%`, [i % 2 ? 'right' : 'left']: `${[8, 6, 85, 80][i]}%`, animation: `float ${[6, 7, 5, 8][i]}s ease-in-out infinite alternate` }}>
                {e}
              </span>
            ))}

            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#8EF0CC]/60 mb-2">
                BETA TESTING - Feedback welcome!
              </p>
              <h1 className="text-2xl font-extrabold text-white leading-tight mb-1">Apna Doctor (Mere bhai)</h1>
              <p className="text-sm text-white/60 mb-5">
                Symptoms बताओ — Hindi, Bengali, English में — सही doctor मिलेगा।
              </p>

              {/* ── Claude Toggle ────────────────────────────── */}
              {/* <ClaudeToggle enabled={useClaudeAI} onToggle={setUseClaudeAI} /> */}

              {/* ── City + Language ───────────────────────────── */}
              <div className="flex gap-2 mb-4">
                <div className="relative flex-1">
                  <button onClick={() => { setShowCityMenu(v => !v); setShowLangMenu(false); }}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-white/80 transition-all"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    <span>📍 {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                  </button>
                  {showCityMenu && (
                    <div className="absolute top-full mt-1 left-0 right-0 rounded-xl overflow-auto z-30 max-h-48"
                      style={{ background: 'rgba(15,32,39,0.98)', border: '1px solid rgba(142,240,204,0.2)', backdropFilter: 'blur(20px)' }}>
                      {cities.map(c => (
                        <button key={c} onClick={() => { setSelectedCity(c); setShowCityMenu(false); }}
                          className="w-full text-left px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10"
                          style={{ color: c === selectedCity ? '#8EF0CC' : 'rgba(255,255,255,0.7)' }}>
                          {c.charAt(0).toUpperCase() + c.slice(1)}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Symptom Input ─────────────────────────────── */}
              <div className="relative mb-3">
                <textarea
                  value={symptomText}
                  onChange={e => setSymptomText(e.target.value)}
                  placeholder={`अपने symptoms यहाँ लिखें या mic से बोलें...\nExample: "Mujhe 2 din se bukhaar hai aur sar dard ho raha hai"`}
                  rows={3}
                  className="w-full resize-none text-sm text-white placeholder:text-white/30 outline-none rounded-2xl px-4 py-3 pr-12 leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(142,240,204,0.2)' }}
                />
                {symptomText && (
                  <button onClick={() => setSymptomText('')}
                    className="absolute top-3 right-3 text-white/30 hover:text-white/70 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* ── Quick chips ────────────────────────────────── */}
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_SYMPTOMS.map((s, i) => (
                  <button key={i} onClick={() => setSymptomText(s.text)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* ── Mic + Search ──────────────────────────────── */}
              <div className="flex gap-3">
                <MicButton
                  listening={listening}
                  error={error}
                  onStart={() => startListening(selectedLang)}
                  onStop={stopListening}
                  isOnline={isOnline}
                  disabled={isSlowConnection || !isOnline}
                />

                <button
                  onClick={step === 3 ? handleReset : () => handleQuery(symptomText)}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#1D9E75,#0f6e56)', boxShadow: '0 4px 20px rgba(29,158,117,0.35)' }}>
                  {isLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {useClaudeAI ? 'AI सोच रहा है...' : 'Dhundh raha hoon...'}</>
                    : step === 3
                      ? <><X className="w-4 h-4" /> Reset</>
                      : <><Search className="w-4 h-4" /> Doctor Dhundho</>
                  }
                </button>
              </div>

              {/* Error Message with Better Formatting */}
              {speechError && (
                <div className="mt-3 p-3 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <p className="text-xs text-red-300 leading-relaxed flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{speechError}</span>
                  </p>
                  <p className="text-xs text-red-200/60 mt-2 ml-6">
                    💡 Tip: You can always type your symptoms instead of using the microphone.
                  </p>
                </div>
              )}

              {listening && (
                <p className="text-xs text-[#8EF0CC] text-center mt-3 animate-pulse font-medium">
                  🎙️ Listening... Please speak clearly
                </p>
              )}
            </div>
          </div>

          {
            chat && (
              <div className="mb-4 p-4 rounded-xl text-sm text-white/80 leading-relaxed"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  fontFamily: 'inherit'
                }}>
                {chat}
              </div>
            )
          }
          {/* ── AI RESULT ───────────────────────────────────────── */}
          {aiResult && (
            <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>
              <AIResultCard result={aiResult} />
            </div>
          )}

          {/* ── DOCTOR RESULTS ──────────────────────────────────── */}
          {doctors.length > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-white">
                  🩺 {doctors.length} Doctors Found
                  <span className="text-white/40 font-normal ml-1">
                    in {selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}
                  </span>
                </h2>
                <span className="text-xs text-white/40">{aiResult?.specialty}</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {doctors.map((doc, i) => (
                  <DoctorCard key={`${doc.name}-${i}`} doctor={doc} index={i} />
                ))}
              </div>
            </div>
          )}

          {/* ── EMPTY / NO RESULTS ──────────────────────────────── */}
          {step === 3 && doctors.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-3xl">🔍</p>
              <p className="mt-2 text-sm font-bold text-white">Koi doctor nahi mila</p>
              <p className="mt-1 text-xs text-white/55">Try a different city or symptom</p>
            </div>
          )}

          {/* ── HOW IT WORKS ────────────────────────────────────── */}
          {step === 0 && (
            <>
              <div className="mt-4 text-center py-6">
                <div className="text-5xl mb-3">🏥</div>
                <p className="text-sm font-semibold text-white/60">Describe symptoms → Find doctors instantly</p>
                <p className="text-xs text-white/35 mt-1">Works in Hindi, Bengali, English & more Indian languages</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: '🎤', title: 'Boliye ya Likhiye', desc: 'Any Indian language' },
                  { icon: useClaudeAI ? '🤖' : '⚡', title: useClaudeAI ? 'Claude Samjhega' : 'Local Match', desc: useClaudeAI ? 'AI symptom analysis' : 'Instant, no API needed' },
                  { icon: '📋', title: 'Doctor Milega', desc: 'With phone + timings' },
                ].map((s, i) => (
                  <div key={i} className="text-center p-3 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div className="text-2xl mb-1">{s.icon}</div>
                    <p className="text-xs font-bold text-white">{s.title}</p>
                    <p className="text-xs text-white/45 mt-0.5">{s.desc}</p>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
