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
  Loader2, Sparkles, Bot, Zap, LocateFixed, CheckCircle2,
  ChevronUp, RefreshCw
} from 'lucide-react';
import { Helmet } from 'react-helmet';
import { askLLM, askLLMStream, getDoctorCategoryFromSymptoms } from '../../utils/askLlm';
import { set } from 'react-hook-form';
import { supabase } from '../../utils/supabaseClient';
import { useRef } from 'react';

const SPECIALTIES = [
  'General Physician', 'Gynecologist', 'Pediatrician', 'Orthopedic',
  'Dermatologist', 'Cardiologist', 'Dentist', 'ENT Specialist',
  'Pulmonologist', 'Ophthalmologist', 'General Surgeon',
];
const LANG_OPTIONS = [
  { code: 'en-IN', label: 'EN' },
  { code: 'hi-IN', label: 'HI' },
  { code: 'bn-IN', label: 'BN' },
];
const SPECIALTY_ALIASES = {
  'General Physician': ['general physician', 'general-physician', 'physician', 'internal medicine', 'general practitioner', 'clinic', 'doctor'],
  'Gynecologist': ['gynecologist', 'gynaecologist', 'obstetrician'],
  'Pediatrician': ['pediatrician', 'paediatrician', 'child specialist'],
  'Orthopedic': ['orthopedic', 'orthopaedic', 'orthopedic surgeon'],
  'Dermatologist': ['dermatologist', 'skin'],
  'Cardiologist': ['cardiologist', 'cardiac', 'cardio'],
  'Dentist': ['dentist', 'dental'],
  'ENT Specialist': ['ent', 'otolaryngology', 'ear nose throat'],
  'Pulmonologist': ['pulmonologist', 'respiratory'],
  'Ophthalmologist': ['ophthalmologist', 'eye'],
  'General Surgeon': ['general surgeon', 'surgeon', 'surgery'],
};

const URGENCY_CONFIG = {
  high: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)', label: '🚨 Urgent', text: 'See a doctor immediately' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', label: '⚠️ Moderate', text: 'See a doctor within 1–2 days' },
  low: { color: '#1D9E75', bg: 'rgba(29,158,117,0.15)', border: 'rgba(29,158,117,0.3)', label: '✅ Routine', text: 'Schedule an appointment soon' },
};

const WEEKDAY_LABELS = { mon: 'Mon', tue: 'Tue', wed: 'Wed', thu: 'Thu', fri: 'Fri', sat: 'Sat', sun: 'Sun' };

const QUICK_SYMPTOMS = [
  { label: '🤒 Fever', text: 'I have high fever with body pain and headache for 2 days' },
  { label: '🤢 Stomach', text: 'Stomach pain, vomiting and loose motions since morning' },
  { label: '💔 Chest Pain', text: 'Chest pain and shortness of breath' },
  { label: '🦷 Toothache', text: 'Severe toothache and swollen gum' },
  { label: '👶 Child Sick', text: 'My child has fever and is not eating anything' },
  { label: '🩸 Periods', text: 'Irregular periods and stomach cramps with white discharge' },
  { label: '👁️ Eye', text: 'My eyes are red and itching with blurry vision' },
  { label: '🦴 Joint Pain', text: 'Knee pain and joint swelling since 3 days' },
];

const FAQS = [
  { q: 'Is Daanguru AI Doctor free?', a: 'Yes — completely free. No sign-up, no subscription. Available 24/7 in Bengali, Hindi and English.' },
  { q: 'বাংলায় AI ডাক্তারের সাথে কথা বলতে পারব?', a: 'হ্যাঁ। আপনি বাংলায় লক্ষণ বলুন এবং বাংলায় পরামর্শ পান।' },
  { q: 'How does it find doctors near me?', a: 'We use your GPS or pincode to search our database of verified doctors in your area.' },
  { q: 'Is AI Doctor advice safe?', a: 'It provides general guidance only — not diagnosis. For any serious symptom, consult a real doctor. Emergency: call 108.' },
  { q: 'Is my health data private?', a: 'Yes. Health queries are not linked to your identity. We do not sell or share data.' },
];



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
// ─── HELPERS ───────────────────────────────────────────────────────────────
function matchesSpecialty(doctorSpecialty, target) {
  const ds = (doctorSpecialty || '').toLowerCase();
  return (SPECIALTY_ALIASES[target] || [target.toLowerCase()]).some(a => ds.includes(a));
}

// ─── SUPABASE QUERY ────────────────────────────────────────────────────────
async function fetchDoctorsFromSupabase(specialty, pincode) {
  // Build query: specialty match + pincode match
  // We use ilike on specialty for fuzzy match
  const aliases = SPECIALTY_ALIASES[specialty] || [specialty.toLowerCase()];

  let query = supabase
    .from('doctors_master')
    .select('id, name, specialty, city, state, address, phone, fees, rating, reviews, experience, timings, hours, lat, lng, website, maps_url, profile_url, pincode')
    .order('rating', { ascending: false })
    .limit(12);

  // Pincode filter (primary)
  if (pincode && pincode.length === 6) {
    query = query.eq('pincode', pincode);
  }

  const { data, error } = await query;
  if (error) throw error;

  // Client-side specialty filter (since Supabase OR + ilike is complex)
  const filtered = (data || []).filter(d => matchesSpecialty(d.specialty, specialty));

  // If pincode gave results, return them; else return all specialty matches
  return filtered.length > 0 ? filtered : (data || []).filter(d => matchesSpecialty(d.specialty, specialty));
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
// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/10 last:border-0">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-white hover:text-[#8EF0CC] transition-colors">
        <span>{q}</span>
        {open ? <ChevronUp className="w-4 h-4 text-[#8EF0CC] shrink-0" /> : <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />}
      </button>
      {open && <p className="pb-4 text-sm text-white/55 leading-relaxed">{a}</p>}
    </div>
  );
}

function DoctorCard({ doctor, index }) {
  const [expanded, setExpanded] = useState(false);
  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const hours = typeof doctor.hours === 'string' ? JSON.parse(doctor.hours || '[]') : (doctor.hours || []);
  const todayHours = hours.filter(h => !h.closed).find(h => h.day?.includes(todayName));

  return (
    <div
      className="glass-card rounded-2xl overflow-hidden border border-white/10 hover:border-[#8EF0CC]/40 transition-all cursor-pointer"
      style={{ animation: `fadeSlideUp 0.4s ease ${index * 60}ms both` }}
      onClick={() => setExpanded(e => !e)}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-xl"
            style={{ background: 'rgba(29,158,117,0.18)', border: '1px solid rgba(29,158,117,0.35)' }}>
            🩺
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-tight">{doctor.name}</p>
            <p className="text-xs text-[#8EF0CC]/80 mt-0.5">{doctor.specialty}</p>
            {doctor.pincode && (
              <p className="text-[10px] text-white/35 mt-0.5 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" /> PIN: {doctor.pincode}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {doctor.rating && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg"
              style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-yellow-400">{doctor.rating}</span>
              {doctor.reviews && <span className="text-[10px] text-white/40">({doctor.reviews})</span>}
            </div>
          )}
          <div className="animate-bounce-gentle" style={{ transition: 'transform .2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }}>
            <ChevronDown className="w-4 h-4 text-[#8EF0CC]/60" />
          </div>
        </div>
      </div>

      {/* Quick info */}
      <div className="px-4 pb-3 space-y-1">
        {doctor.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-3 h-3 text-white/35 mt-0.5 shrink-0" />
            <p className="text-xs text-white/55 leading-snug line-clamp-2">{doctor.address}</p>
          </div>
        )}
        {(todayHours || doctor.timings) && (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-white/35 shrink-0" />
            <p className="text-xs text-white/55">
              {todayHours ? `Today: ${todayHours.raw?.split(':').slice(1).join(':').trim() || 'Open'}` : doctor.timings}
            </p>
          </div>
        )}
        {doctor.experience && (
          <div className="flex items-center gap-2">
            <Stethoscope className="w-3 h-3 text-white/35 shrink-0" />
            <p className="text-xs text-white/55">{doctor.experience}</p>
          </div>
        )}
      </div>

      {/* Expanded contact */}
      {expanded && (
        <div className="border-t border-white/10 p-4 space-y-2" onClick={e => e.stopPropagation()}>
          {doctor.phone && (
            <a href={`tel:${doctor.phone}`}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all hover:opacity-80"
              style={{ background: 'linear-gradient(135deg,#1D9E75,#0f6e56)', color: '#fff' }}>
              <Phone className="w-4 h-4" /> {doctor.phone}
              <span className="ml-auto text-xs opacity-80">Tap to Call</span>
            </a>
          )}
          {doctor.fees && (
            <p className="text-xs text-white/50 px-1">Consultation Fees: <strong className="text-white/80">₹{doctor.fees}</strong></p>
          )}
          <div className="flex gap-2">
            {doctor.maps_url && (
              <a href={doctor.maps_url} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
                🗺️ Maps
              </a>
            )}
            {doctor.profile_url && (
              <a href={doctor.profile_url} target="_blank" rel="noopener noreferrer"
                className="flex-1 text-center py-2 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.75)' }}>
                👤 Profile
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function AIResultCard({ result }) {
  const u = URGENCY_CONFIG[result.urgency] || URGENCY_CONFIG.low;
  return (
    <div className="rounded-2xl p-4 mb-4" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(142,240,204,0.15)' }}>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: u.bg, border: `1px solid ${u.border}`, color: u.color }}>
          {u.label}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', color: '#a5b4fc' }}>
            <Sparkles className="w-3 h-3" /> Claude AI
          </span>
          <span className="text-xs text-white/50">{u.text}</span>
        </div>
      </div>

      {result.summary && <p className="text-sm text-white/80 leading-relaxed mb-3">{result.summary}</p>}

      <div className="flex items-center gap-2 p-2.5 rounded-xl mb-3"
        style={{ background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.25)' }}>
        <Stethoscope className="w-4 h-4 text-[#8EF0CC]" />
        <div>
          <p className="text-[10px] text-[#8EF0CC]/70">Recommended Specialist</p>
          <p className="text-sm font-bold text-white">{result.specialty}</p>
        </div>
      </div>

      {result.advice && (
        <div className="flex gap-2 p-2.5 rounded-xl text-xs text-white/65 leading-relaxed"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-yellow-400" />
          {result.advice}
        </div>
      )}
      <p className="text-[10px] text-white/30 mt-3 text-center">⚕️ Guidance only. Always consult a qualified doctor. Emergency: 108</p>
    </div>
  );
}

function LocationBar({ pincode, city, locating, onDetect, onManualChange }) {
  return (
    <div className="flex gap-2 mb-4">
      {/* Pincode input */}
      <div className="flex-1 flex items-center rounded-xl border border-white/15 overflow-hidden focus-within:border-[#8EF0CC]/50 transition-colors"
        style={{ background: 'rgba(255,255,255,0.06)' }}>
        <MapPin className="w-3.5 h-3.5 ml-3 text-[#8EF0CC]/60 shrink-0" />
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="Enter pincode (e.g. 721507)"
          value={pincode}
          onChange={e => onManualChange(e.target.value.replace(/\D/g, ''))}
          className="flex-1 px-2 py-2.5 text-sm text-white placeholder:text-white/30 outline-none bg-transparent"
        />
        {city && <span className="text-[10px] text-[#8EF0CC]/60 mr-2 font-medium whitespace-nowrap">{city}</span>}
      </div>

      {/* GPS button */}
      <button
        onClick={onDetect}
        disabled={locating}
        title="Detect my location"
        className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-all disabled:opacity-50 hover:scale-105"
        style={{ background: 'rgba(29,158,117,0.18)', color: '#8EF0CC', border: '1px solid rgba(29,158,117,0.35)' }}>
        {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
        <span className="hidden sm:inline">{locating ? 'Locating…' : 'Auto'}</span>
      </button>
    </div>
  );
}

// ─── STREAMING CHAT BOX ────────────────────────────────────────────────────
function ChatBox({ text }) {
  if (!text) return null;
  return (
    <div className="mb-4 p-4 rounded-2xl text-sm text-white/80 leading-relaxed whitespace-pre-wrap"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(142,240,204,0.15)', fontFamily: 'inherit' }}>
      <div className="flex items-center gap-2 mb-2">
        <Bot className="w-4 h-4 text-[#8EF0CC]" />
        <span className="text-[10px] font-bold text-[#8EF0CC] uppercase tracking-widest">AI Doctor</span>
      </div>
      {text}
    </div>
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
  const [error, setError] = useState('');
  const [step, setStep] = useState(0);
  const [chat, setChat] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [locating, setLocating] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);


  // ✅ USE REACT-SPEECH-RECOGNITION HOOK
  const {
    transcript,
    listening,
    error: speechError,
    startListening,
    stopListening,
    resetTranscript
  } = useSpeechRecognitionWithRetry();


  // ✅ UPDATE symptomText when transcript changes
  useEffect(() => {
    if (transcript) {
      setSymptomText(transcript);
    }
  }, [transcript]);
  useEffect(() => {
    handleDetectLocation();
  }, []);

  // ─── PINCODE DETECTOR ─────────────────────────────────────────────────────
  async function getPincodeFromCoords(lat, lng) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
      const d = await r.json();
      return { pincode: d.address?.postcode || '', city: d.address?.city || d.address?.town || d.address?.village || '' };
    } catch { return { pincode: '', city: '' }; }
  }
  // ── DETECT LOCATION ───────────────────────────────────────────────────────
  const handleDetectLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { pincode: pc, city: ct } = await getPincodeFromCoords(pos.coords.latitude, pos.coords.longitude);
        setLocating(false);
        if (pc) { setPincode(pc); setCity(ct); }
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };
  // ─── SEARCH ────────────────────────────────────────────────────────────────

  const extractData = async () => {
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
    const category = await getDoctorCategoryFromSymptoms(symptomText);
    console.log('category', category)
    const doctors = await fetchDoctorsFromSupabase(category, pincode);
    console.log('Doctors fetched:', doctors);
    setDoctors(doctors);
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
        <title>Free AI Doctor Online India — Symptom Checker in Bengali & English | Daanguru</title>
        <meta name="description" content="Check your symptoms with Daanguru's free AI Doctor. Get instant health guidance in Bengali, Hindi and English. Find doctors near you by pincode. Available 24/7." />
        <meta name="keywords" content="AI doctor free India, symptom checker India, online doctor West Bengal, AI health assistant India, free doctor online Bengali, symptom checker Bengali, AI doctor Jhargram, বিনামূল্যে অনলাইন ডাক্তার" />
        <meta name="robots" content="index, follow" />
        <meta name="geo.region" content="IN-WB" />
        <meta name="geo.placename" content="Jhargram, West Bengal, India" />
        <link rel="canonical" href="https://www.daanguru.in/ai-doctor/" />
        <meta property="og:title" content="Free AI Doctor Online — Bengali & English | Daanguru" />
        <meta property="og:description" content="Get instant AI health guidance. Find doctors near your pincode." />
        <meta property="og:url" content="https://www.daanguru.in/ai-doctor/" />
        <meta property="og:image" content="https://www.daanguru.in/logo.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Daanguru AI Doctor",
          "url": "https://www.daanguru.in/ai-doctor/",
          "applicationCategory": "HealthApplication",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "INR" },
          "availableLanguage": ["English", "Bengali", "Hindi"],
          "areaServed": { "@type": "Country", "name": "India" }
        })}</script>
      </Helmet>

      <style>{`
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes float { from{transform:translateY(0) rotate(0deg)} to{transform:translateY(-12px) rotate(8deg)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(2.2);opacity:0} }
        .mic-pulse::before { content:''; position:absolute; inset:0; border-radius:inherit; background:rgba(29,158,117,.4); animation:pulse-ring 1.2s ease-out infinite; }
      `}</style>
      {/* ── MEDICAL DISCLAIMER BANNER ── */}
      <div className="w-full px-4 py-3 flex items-start gap-3 text-xs"
        style={{ background: '#FEF3C7', borderBottom: '3px solid #D97706' }}>
        <span className="text-lg shrink-0">⚕️</span>
        <p style={{ color: '#92400E' }}>
          <strong>Medical Disclaimer:</strong> Daanguru AI Doctor provides general health information only.
          It is <strong>not a substitute for professional medical advice.</strong> Always consult a qualified doctor. Emergency: <strong>Call 108</strong>.
        </p>
      </div>
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
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-xs font-bold uppercase tracking-widest text-[#8EF0CC]/80"
                style={{ background: 'rgba(29,158,117,0.1)', border: '1px solid rgba(29,158,117,0.3)' }}>
                <span className="w-2 h-2 rounded-full bg-[#8EF0CC] animate-pulse" />
                AI · 24/7 · Free · Bengali + Hindi + English
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight mb-1">
                Apna AI Doctor 🩺
              </h1>
              <p className="text-sm text-white/55 mb-1">
                Symptoms बताओ — Hindi, Bengali, English में — सही doctor मिलेगा।
              </p>
              <p className="text-sm text-white/35 mb-5" style={{ fontFamily: 'Noto Sans Bengali, sans-serif' }}>
                আপনার লক্ষণ বলুন — কাছের ডাক্তার খুঁজে পাবেন।
              </p>

              {/* ── LOCATION BAR ── */}
              <LocationBar
                pincode={pincode}
                city={city}
                locating={locating}
                onDetect={handleDetectLocation}
                onManualChange={(v) => { setPincode(v); setCity(''); }}
              />

              {/* ── SYMPTOM TEXTAREA ── */}
              <div className="relative mb-3">
                <textarea
                  value={symptomText}
                  onChange={e => setSymptomText(e.target.value)}
                  placeholder={`अपने symptoms यहाँ लिखें या mic से बोलें…\nExample: "Mujhe 2 din se bukhaar hai aur sar dard ho raha hai"\nবাংলা: "আমার দুই দিন ধরে জ্বর ও মাথাব্যথা হচ্ছে"`}
                  rows={3}
                  className="w-full resize-none text-sm text-white placeholder:text-white/30 outline-none rounded-2xl px-4 py-3 pr-10 leading-relaxed"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(142,240,204,0.2)' }}
                  onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleQuery(symptomText); }}
                />
                {symptomText && (
                  <button onClick={() => { setSymptomText(''); resetTranscript(); }}
                    className="absolute top-3 right-3 text-white/30 hover:text-white/70">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* ── QUICK CHIPS ── */}
              <div className="flex flex-wrap gap-2 mb-4">
                {QUICK_SYMPTOMS.map((s, i) => (
                  <button key={i} onClick={() => setSymptomText(s.text)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-all hover:scale-105 active:scale-95"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* ── MIC + LANG + SEARCH ── */}
              <div className="flex gap-2">

                {/* Language selector */}
                {/* <div className="relative">
                  <button onClick={() => setShowLangMenu(v => !v)}
                    className="h-12 px-3 rounded-xl flex items-center gap-1 text-xs font-bold text-white/70 transition-all hover:text-white"
                    style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                    🌐 {LANG_OPTIONS.find(l => l.code === selectedLang)?.label}
                    <ChevronDown className="w-3 h-3 opacity-50" />
                  </button>
                  {showLangMenu && (
                    <div className="absolute bottom-full mb-1 left-0 rounded-xl overflow-hidden z-30 min-w-[110px]"
                      style={{ background: 'rgba(15,32,39,0.98)', border: '1px solid rgba(142,240,204,0.2)', backdropFilter: 'blur(20px)' }}>
                      {LANG_OPTIONS.map(l => (
                        <button key={l.code} onClick={() => { setSelectedLang(l.code); setShowLangMenu(false); }}
                          className="w-full text-left px-3 py-2 text-xs font-medium hover:bg-white/10 transition-colors"
                          style={{ color: l.code === selectedLang ? '#8EF0CC' : 'rgba(255,255,255,0.7)' }}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div> */}

                {/* Mic button */}
                <button
                  onClick={listening ? stopListening : () => startListening(selectedLang)}
                  className="relative h-12 w-12 rounded-xl flex items-center justify-center transition-all hover:scale-105"
                  style={{ background: listening ? 'rgba(239,68,68,0.25)' : 'rgba(29,158,117,0.2)', border: `1px solid ${listening ? 'rgba(239,68,68,0.5)' : 'rgba(29,158,117,0.5)'}` }}>
                  {listening && <span className="mic-pulse absolute inset-0 rounded-xl" />}
                  {listening
                    ? <MicOff className="w-5 h-5 text-red-400 relative z-10" />
                    : <Mic className="w-5 h-5 text-[#8EF0CC] relative z-10" />
                  }
                </button>

                {/* Search / Reset */}
                <button
                  onClick={hasSearched ? handleReset : () => handleQuery(symptomText)}
                  disabled={isLoading}
                  className="flex-1 h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg,#1D9E75,#0f6e56)', boxShadow: '0 4px 20px rgba(29,158,117,0.35)' }}>
                  {isLoading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> AI सोच रहा है…</>
                    : hasSearched
                      ? <><RefreshCw className="w-4 h-4" /> नई खोज</>
                      : <><Search className="w-4 h-4" /> Doctor Dhundho</>
                  }
                </button>
              </div>
              {/* Speech error */}
              {speechError && (
                <div className="mt-3 p-3 rounded-xl flex items-start gap-2"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-red-300">{speechError}</p>
                    <p className="text-xs text-red-200/50 mt-1">💡 Type your symptoms instead — works just as well!</p>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="mt-3 text-xs text-red-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {error}
                </p>
              )}

              {listening && (
                <p className="text-xs text-[#8EF0CC] text-center mt-3 animate-pulse font-medium">
                  🎙️ Listening… Speak clearly in {LANG_OPTIONS.find(l => l.code === selectedLang)?.label}
                </p>
              )}

              {/* Pincode status */}
              {pincode && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
                  style={{ background: 'rgba(29,158,117,0.1)', color: '#8EF0CC', border: '1px solid rgba(29,158,117,0.25)' }}>
                  <CheckCircle2 className="w-3 h-3" />
                  Searching near PIN: {pincode}{city ? ` · ${city}` : ''}
                </div>
              )}
            </div>
          </div>



          {/* AI streaming reply */}
          {chat && (<ChatBox text={chat} />)}

          {/* AI result card */}
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
          {hasSearched && doctors.length === 0 && (
            <div className="mt-8 text-center">
              <p className="text-3xl">🔍</p>
              <p className="mt-2 text-sm font-bold text-white">Koi doctor nahi mila</p>
              <p className="mt-1 text-xs text-white/55">Try a different city or symptom</p>
            </div>
          )}

          {/* Features */}
          <div className="mt-10 grid grid-cols-2 gap-3"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2rem' }}>
            <p className="col-span-2 text-xs font-bold uppercase tracking-widest text-[#8EF0CC]/60 mb-1">Why Daanguru AI Doctor</p>
            {[
              { icon: '🗣️', title: 'Bengali + Hindi + English', desc: 'Describe in any Indian language' },
              { icon: '⚡', title: 'Instant Response', desc: 'AI guidance in seconds, 24/7' },
              { icon: '📍', title: 'Pincode-wise Doctors', desc: 'Find doctors near your location' },
              { icon: '🆓', title: 'Completely Free', desc: 'No subscription, no fees, ever' },
            ].map((f, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 border border-white/10">
                <div className="text-xl mb-2">{f.icon}</div>
                <p className="text-xs font-bold text-white mb-1">{f.title}</p>
                <p className="text-[11px] text-white/50 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Trust signals */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { icon: '⚕️', title: 'Medical Disclaimer', desc: 'AI guidance is general info only. Always see a real doctor.' },
              { icon: '🔒', title: 'Privacy First', desc: 'Your health data is never stored or shared.' },
              { icon: '🏥', title: 'Emergency: 108', desc: 'For emergencies in West Bengal, call 108 immediately.' },
              { icon: '📋', title: 'About Daanguru', desc: 'West Bengal platform serving Jhargram, Midnapore & all districts.' },
            ].map((t, i) => (
              <div key={i} className="glass-card rounded-2xl p-4 border border-white/10 text-center">
                <div className="text-2xl mb-2">{t.icon}</div>
                <p className="text-xs font-bold text-white mb-1">{t.title}</p>
                <p className="text-[11px] text-white/45 leading-relaxed">{t.desc}</p>
              </div>
            ))}
          </div>

          {/* Disease quick links (SEO internal linking) */}
          <div className="mt-8" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2rem' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-[#8EF0CC]/60 mb-4">Health Conditions</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Diabetes / মধুমেহ', sub: 'Symptoms, diet, management', href: '/ai-doctor/diabetes/' },
                { name: 'High Blood Pressure', sub: 'উচ্চ রক্তচাপ — Signs & care', href: '/ai-doctor/hypertension/' },
                { name: 'Dengue / ডেঙ্গু', sub: 'Symptoms & when to see doctor', href: '/ai-doctor/dengue/' },
                { name: 'Malaria / ম্যালেরিয়া', sub: 'Common in West Bengal — Guide', href: '/ai-doctor/malaria/' },
                { name: 'Typhoid / টাইফয়েড', sub: 'Diet & treatment guide', href: '/ai-doctor/typhoid/' },
                { name: 'বাংলায় জিজ্ঞাসা করুন', sub: 'Ask AI Doctor in Bengali', href: '/ai-doctor/bengali/', highlight: true },
              ].map((d, i) => (
                <a key={i} href={d.href}
                  className="glass-card border rounded-xl p-3 transition-all hover:-translate-y-0.5 group"
                  style={{ borderColor: d.highlight ? 'rgba(29,158,117,0.5)' : 'rgba(255,255,255,0.1)', background: d.highlight ? 'rgba(29,158,117,0.08)' : 'transparent' }}>
                  <p className="text-xs font-bold text-white group-hover:text-[#8EF0CC] transition-colors">{d.name}</p>
                  <p className="text-[10px] text-white/40 mt-0.5">{d.sub}</p>
                  <span className="text-[10px] text-[#8EF0CC]/60 font-semibold mt-1 block">Learn more →</span>
                </a>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-8 glass-card rounded-2xl px-5 py-2 border border-white/10"
            style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-bold uppercase tracking-widest text-[#8EF0CC]/60 pt-4 mb-1">FAQ</p>
            <h2 className="text-lg font-bold text-white mb-4">Questions About AI Doctor</h2>
            {FAQS.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
          </div>

          {/* SEO text block */}
          <div className="mt-8 glass-card rounded-2xl p-6 border border-white/10 text-sm text-white/50 leading-8 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-[#8EF0CC]/60 mb-2">About Daanguru AI Doctor</p>
            <p>
              Daanguru AI Doctor is one of India's first free AI-powered health tools available in <strong className="text-white/75">Bengali, Hindi and English</strong>, built for users in West Bengal — Jhargram, Midnapore, Bankura, Purulia and rural districts.
            </p>
            <p>
              Describe symptoms → AI detects the right specialist → Doctors near your <strong className="text-white/75">pincode</strong> are shown instantly. Covers fever, dengue, diabetes, hypertension, bone pain, skin issues, child health and more.
            </p>
            <p className="font-semibold text-white/60">
              ⚕️ For emergencies always call 108. AI Doctor is for guidance only, not diagnosis.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
