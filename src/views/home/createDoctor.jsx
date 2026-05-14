/**
 * ================================================================
 *  AddDoctorPage.jsx  —  DaanGuru Admin: Add / Register Doctor
 *
 *  Supabase table: doctors_master
 *  Import:  import { supabase } from '../../utils/supabaseClient'
 *
 *  Location autocomplete uses Google Places API (no external lib).
 *  Add your key to .env:  VITE_GOOGLE_MAPS_KEY=AIza...
 *  The script is loaded once lazily inside useGooglePlaces().
 *
 *  Sections:
 *    1. Basic Info    — name, specialty, qualification, experience, gender, languages
 *    2. Clinic        — clinic name, address, city, state, pincode
 *    3. Location      — Google Places autocomplete → auto-fills address/city/pincode/lat/lng
 *    4. Contact       — phone, phone2, email, website, profile URL
 *    5. Fees / Rating — fees, rating, reviews, verified, featured
 *    6. Hours         — weekly schedule builder → hours JSON + timings text
 *    7. Live Preview  — real-time card
 * ================================================================
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import {
    User, MapPin, Phone, Clock, Star,
    IndianRupee, CheckCircle2, AlertCircle,
    Loader2, Plus, Eye, EyeOff, Send, RotateCcw,
    Building2, Award, ChevronDown, Languages, Navigation,
    Search, X,
} from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const SPECIALTIES = [
    'General Physician', 'Gynecologist', 'Pediatrician', 'Orthopedic',
    'Dermatologist', 'Cardiologist', 'Dentist', 'ENT Specialist',
    'Pulmonologist', 'Ophthalmologist', 'General Surgeon',
];

const STATES = [
    'West Bengal', 'Odisha', 'Jharkhand', 'Bihar', 'Assam',
    'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Other',
];

const LANGUAGE_OPTIONS = ['Bengali', 'Hindi', 'English', 'Odia', 'Santali', 'Urdu', 'Telugu', 'Tamil'];

const WEEKDAYS = [
    { key: 'mon', label: 'Mon' }, { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' }, { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' }, { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
];

const DEFAULT_HOURS = Object.fromEntries(
    WEEKDAYS.map(({ key }) => [key, { open: '09:00', close: '18:00', closed: false }])
);

const EMPTY = {
    name: '', specialty: '', qualification: '', experience: '', gender: '',
    clinic_name: '', address: '', area: '', city: '', state: 'West Bengal', pincode: '',
    maps_url: '', lat: '', lng: '',
    phone: '', phone2: '', email: '', website: '', profile_url: '',
    fees: '', rating: '', reviews: '', timings: '',
    is_verified: false, is_featured: false,
    languages: [],
};

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────

const C = {
    green: '#1D9E75',
    glow: '#8EF0CC',
    card: 'rgba(255,255,255,0.04)',
    border: 'rgba(255,255,255,0.09)',
    muted: 'rgba(255,255,255,0.35)',
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function buildTimingsText(hours) {
    const groups = {};
    WEEKDAYS.forEach(({ key, label }) => {
        const h = hours[key];
        if (h.closed) return;
        const slot = `${h.open}–${h.close}`;
        if (!groups[slot]) groups[slot] = [];
        groups[slot].push(label);
    });
    return Object.entries(groups).map(([t, d]) => `${d.join('/')} ${t}`).join(' | ') || '';
}

function buildHoursJson(hours) {
    return WEEKDAYS.map(({ key, label }) => ({
        day: label, open: hours[key].open, close: hours[key].close, closed: hours[key].closed,
        raw: hours[key].closed ? `${label}: Closed` : `${label}: ${hours[key].open}–${hours[key].close}`,
    }));
}

/**
 * Extract address components from a Google Place result.
 * Returns { address, area, city, state, pincode, lat, lng, maps_url }
 */
function extractPlaceData(place) {
    const get = (types) => {
        const c = place.address_components?.find(c => types.some(t => c.types.includes(t)));
        return c?.long_name || '';
    };
    const getShort = (types) => {
        const c = place.address_components?.find(c => types.some(t => c.types.includes(t)));
        return c?.short_name || '';
    };

    const streetNumber = get(['street_number']);
    const route = get(['route']);
    const sublocality = get(['sublocality_level_1', 'sublocality', 'neighborhood']);
    const city = get(['locality', 'administrative_area_level_2']);
    const state = get(['administrative_area_level_1']);
    const pincode = get(['postal_code']);
    const lat = place.geometry?.location?.lat()?.toFixed(6) || '';
    const lng = place.geometry?.location?.lng()?.toFixed(6) || '';

    const addressParts = [streetNumber, route].filter(Boolean);
    const address = addressParts.length ? addressParts.join(' ') : place.formatted_address || '';

    return {
        address,
        area: sublocality,
        city,
        state,
        pincode,
        lat,
        lng,
        maps_url: place.url || `https://maps.google.com/?q=${lat},${lng}`,
    };
}

// ─── GOOGLE PLACES HOOK ───────────────────────────────────────────────────────

const GMAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

function loadGoogleMaps() {
    return new Promise((resolve, reject) => {
        if (window.google?.maps?.places) { resolve(); return; }
        if (document.getElementById('gm-script')) {
            // script already injected, wait for it
            const poll = setInterval(() => {
                if (window.google?.maps?.places) { clearInterval(poll); resolve(); }
            }, 100);
            return;
        }
        const s = document.createElement('script');
        s.id = 'gm-script';
        s.src = `https://maps.googleapis.com/maps/api/js?key=${GMAPS_KEY}&libraries=places&language=en`;
        s.async = true;
        s.onload = resolve;
        s.onerror = () => reject(new Error('Google Maps failed to load'));
        document.head.appendChild(s);
    });
}

/**
 * useGooglePlaces — attaches Places Autocomplete to an <input> ref.
 *
 * @param {React.RefObject} inputRef   — the input element
 * @param {Function}        onSelect   — called with extracted place data on selection
 * @param {Object}          options    — { types, componentRestrictions }
 */
function useGooglePlaces(inputRef, onSelect, options = {}) {
    const acRef = useRef(null);
    const [ready, setReady] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!GMAPS_KEY) { setError('VITE_GOOGLE_MAPS_KEY not set'); return; }

        loadGoogleMaps()
            .then(() => {
                if (!inputRef.current) return;

                acRef.current = new window.google.maps.places.Autocomplete(inputRef.current, {
                    types: options.types || ['establishment', 'geocode'],
                    componentRestrictions: options.componentRestrictions || { country: 'in' },
                    fields: ['address_components', 'formatted_address', 'geometry', 'name', 'url'],
                });

                acRef.current.addListener('place_changed', () => {
                    const place = acRef.current.getPlace();
                    if (!place.geometry) return; // user pressed Enter on an unresolved query
                    onSelect(place);
                });

                setReady(true);
            })
            .catch(err => setError(err.message));

        return () => {
            // Clean up listener (Places Autocomplete doesn't expose removeListener directly,
            // but clearing the instance is enough for unmount cleanup)
            if (acRef.current && window.google?.maps?.event) {
                window.google.maps.event.clearInstanceListeners(acRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { ready, error: error };
}

// ─── LOCATION AUTOCOMPLETE COMPONENT ─────────────────────────────────────────

/**
 * LocationAutocomplete
 *
 * Props:
 *   onPlaceSelect(data)  — called with { address, area, city, state, pincode, lat, lng, maps_url }
 *   error                — validation error string
 */
function LocationAutocomplete({ onPlaceSelect, error: fieldError }) {
    const inputRef = useRef(null);
    const [value, setValue] = useState('');
    const [picked, setPicked] = useState(null); // resolved place data
    const [focused, setFocused] = useState(false);

    const handleSelect = useCallback((place) => {
        const data = extractPlaceData(place);
        const displayName = place.name
            ? `${place.name}, ${place.formatted_address}`
            : place.formatted_address;
        setValue(displayName || '');
        setPicked(data);
        onPlaceSelect(data);
    }, [onPlaceSelect]);

    const { ready, error: scriptError } = useGooglePlaces(inputRef, handleSelect, {
        types: ['establishment', 'geocode'],
        componentRestrictions: { country: 'in' },
    });

    const clear = () => {
        setValue('');
        setPicked(null);
        onPlaceSelect(null);
        if (inputRef.current) inputRef.current.focus();
    };

    const borderColor = fieldError
        ? 'rgba(248,113,113,0.5)'
        : focused
            ? 'rgba(142,240,204,0.45)'
            : C.border;

    return (
        <div>
            {/* Input wrapper */}
            <div style={{ position: 'relative' }}>
                <Search size={13} style={{
                    position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)',
                    color: focused ? C.glow : 'rgba(255,255,255,0.25)', pointerEvents: 'none',
                    transition: 'color .2s',
                }} />
                <input
                    ref={inputRef}
                    value={value}
                    onChange={e => { setValue(e.target.value); if (picked) { setPicked(null); onPlaceSelect(null); } }}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={ready ? 'Search clinic or area (e.g. Jhargram Station Road)…' : 'Loading Google Places…'}
                    disabled={!!scriptError}
                    style={{
                        width: '100%', boxSizing: 'border-box',
                        padding: '10px 36px 10px 32px',
                        borderRadius: 12, fontSize: 13, color: '#fff', outline: 'none',
                        transition: 'all .2s', fontFamily: 'inherit',
                        background: focused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.055)',
                        border: `1px solid ${borderColor}`,
                    }}
                />
                {/* Clear button */}
                {value && (
                    <button type="button" onClick={clear} style={{
                        position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                        color: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center',
                    }}>
                        <X size={13} />
                    </button>
                )}
            </div>

            {/* Script load error */}
            {scriptError && (
                <p style={{ fontSize: 10, color: '#f87171', marginTop: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
                    <AlertCircle size={10} /> {scriptError} — set VITE_GOOGLE_MAPS_KEY in .env
                </p>
            )}

            {/* Field validation error */}
            {fieldError && !scriptError && (
                <p style={{ fontSize: 10, color: '#f87171', marginTop: 4, display: 'flex', gap: 4, alignItems: 'center' }}>
                    <AlertCircle size={10} /> {fieldError}
                </p>
            )}

            {/* Resolved tags */}
            {picked && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {[
                        picked.area && `📍 ${picked.area}`,
                        picked.city && `🏙 ${picked.city}`,
                        picked.state && `🗺 ${picked.state}`,
                        picked.pincode && `📮 ${picked.pincode}`,
                        picked.lat && `🌐 ${picked.lat}, ${picked.lng}`,
                    ].filter(Boolean).map(tag => (
                        <span key={tag} style={{
                            fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                            background: 'rgba(29,158,117,0.15)', color: C.glow,
                            border: '1px solid rgba(29,158,117,0.3)',
                        }}>{tag}</span>
                    ))}
                    <span style={{
                        fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                        background: 'rgba(29,158,117,0.25)', color: '#fff',
                        border: '1px solid rgba(29,158,117,0.5)',
                        display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                        <CheckCircle2 size={9} /> Auto-filled ↓
                    </span>
                </div>
            )}

            {/* Hint */}
            {!picked && !scriptError && (
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>
                    Select from the dropdown — address, city, pincode & coordinates fill automatically
                </p>
            )}
        </div>
    );
}

// ─── DESIGN PRIMITIVES ────────────────────────────────────────────────────────

function SectionCard({ children, delay = 0 }) {
    return (
        <div style={{
            background: C.card, border: `1px solid ${C.border}`, borderRadius: 20,
            padding: '1.5rem', marginBottom: '1rem', backdropFilter: 'blur(14px)',
            animation: `dg-up .45s ease ${delay}ms both`,
        }}>
            {children}
        </div>
    );
}

function SectionHead({ icon: Icon, label, sub }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(29,158,117,0.15)', border: '1px solid rgba(29,158,117,0.3)' }}>
                <Icon size={16} color={C.glow} />
            </div>
            <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{label}</p>
                {sub && <p style={{ fontSize: 11, color: C.muted, margin: '2px 0 0' }}>{sub}</p>}
            </div>
        </div>
    );
}

function Label({ children, required }) {
    return (
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(142,240,204,0.65)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4, margin: '0 0 6px' }}>
            {children}{required && <span style={{ color: '#f87171', fontWeight: 900 }}>*</span>}
        </p>
    );
}

function Hint({ children }) {
    return <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>{children}</p>;
}

function ErrMsg({ msg }) {
    if (!msg) return null;
    return <p style={{ fontSize: 10, color: '#f87171', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}><AlertCircle size={10} /> {msg}</p>;
}

function useInputStyle(error) {
    const [focused, setFocused] = useState(false);
    const style = {
        width: '100%', boxSizing: 'border-box', padding: '10px 12px', borderRadius: 12, fontSize: 13, color: '#fff',
        outline: 'none', transition: 'all .2s', fontFamily: 'inherit',
        background: focused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.055)',
        border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : focused ? 'rgba(142,240,204,0.45)' : C.border}`,
    };
    return { style, onFocus: () => setFocused(true), onBlur: () => setFocused(false) };
}

function Input({ value, onChange, placeholder, type = 'text', error, inputMode, maxLength, disabled, readOnly }) {
    const { style, ...events } = useInputStyle(error);
    return (
        <input value={value} onChange={onChange} placeholder={placeholder} type={type}
            inputMode={inputMode} maxLength={maxLength} disabled={disabled} readOnly={readOnly}
            style={{ ...style, color: (disabled || readOnly) ? C.muted : '#fff', cursor: readOnly ? 'default' : 'text' }}
            {...events} />
    );
}

function Textarea({ value, onChange, placeholder, rows = 2 }) {
    const { style, ...events } = useInputStyle(false);
    return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{ ...style, resize: 'vertical', lineHeight: 1.5 }} {...events} />;
}

function Select({ value, onChange, options, placeholder, error }) {
    const { style, ...events } = useInputStyle(error);
    return (
        <div style={{ position: 'relative' }}>
            <select value={value} onChange={onChange}
                style={{ ...style, appearance: 'none', paddingRight: 32, cursor: 'pointer', color: value ? '#fff' : 'rgba(255,255,255,0.25)' }}
                {...events}>
                <option value="" disabled style={{ background: '#0d1f2d', color: 'rgba(255,255,255,0.4)' }}>{placeholder}</option>
                {options.map(o => <option key={o} value={o} style={{ background: '#0d1f2d', color: '#fff' }}>{o}</option>)}
            </select>
            <ChevronDown size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.glow, opacity: .6 }} />
        </div>
    );
}

function Toggle({ checked, onChange, label }) {
    return (
        <button type="button" onClick={() => onChange(!checked)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, border: `1px solid ${checked ? 'rgba(29,158,117,0.5)' : C.border}`, background: checked ? 'rgba(29,158,117,0.18)' : 'rgba(255,255,255,0.05)', cursor: 'pointer', fontSize: 12, fontWeight: 700, transition: 'all .2s', color: checked ? C.glow : C.muted, whiteSpace: 'nowrap' }}>
            <div style={{ width: 32, height: 18, borderRadius: 9, position: 'relative', transition: 'all .2s', flexShrink: 0, background: checked ? 'rgba(29,158,117,0.5)' : 'rgba(255,255,255,0.12)', border: `1px solid ${checked ? 'rgba(29,158,117,0.7)' : C.border}` }}>
                <div style={{ position: 'absolute', top: 2, width: 12, height: 12, borderRadius: '50%', transition: 'all .2s', background: checked ? C.glow : 'rgba(255,255,255,0.35)', left: checked ? 'calc(100% - 14px)' : 2 }} />
            </div>
            {label}
        </button>
    );
}

function Grid({ cols = 2, children }) {
    return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14 }}>{children}</div>;
}

function Col({ span = 1, children }) {
    return <div style={{ gridColumn: `span ${span}` }}>{children}</div>;
}

function Field({ label, hint, error, required, children }) {
    return (
        <div>
            <Label required={required}>{label}</Label>
            {children}
            {hint && !error && <Hint>{hint}</Hint>}
            {error && <ErrMsg msg={error} />}
        </div>
    );
}

// ─── HOURS BUILDER ────────────────────────────────────────────────────────────

function HoursBuilder({ hours, onChange }) {
    const update = (day, field, val) => onChange({ ...hours, [day]: { ...hours[day], [field]: val } });
    const setAll = (closed) => {
        const next = { ...hours };
        WEEKDAYS.forEach(({ key }) => { next[key] = { ...next[key], closed }; });
        onChange(next);
    };
    return (
        <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${C.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'rgba(29,158,117,0.1)', borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.glow, letterSpacing: '.06em', textTransform: 'uppercase' }}>Weekly Schedule</span>
                <div style={{ display: 'flex', gap: 6 }}>
                    {[['All Open', false, C.green], ['All Closed', true, '#ef4444']].map(([lbl, val, col]) => (
                        <button key={lbl} type="button" onClick={() => setAll(val)}
                            style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 7, cursor: 'pointer', border: 'none', background: `${col}22`, color: col === C.green ? C.glow : '#fca5a5', outline: `1px solid ${col}44` }}>
                            {lbl}
                        </button>
                    ))}
                </div>
            </div>
            {WEEKDAYS.map(({ key, label }) => {
                const h = hours[key];
                return (
                    <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderBottom: `1px solid rgba(255,255,255,0.04)`, background: h.closed ? 'rgba(239,68,68,0.03)' : 'transparent' }}>
                        <button type="button" onClick={() => update(key, 'closed', !h.closed)}
                            style={{ width: 36, height: 20, borderRadius: 10, position: 'relative', flexShrink: 0, cursor: 'pointer', transition: 'all .2s', border: 'none', background: h.closed ? 'rgba(239,68,68,0.3)' : 'rgba(29,158,117,0.35)' }}>
                            <div style={{ position: 'absolute', top: 2, width: 14, height: 14, borderRadius: '50%', transition: 'all .2s', background: h.closed ? '#fca5a5' : C.glow, left: h.closed ? 2 : 'calc(100% - 16px)' }} />
                        </button>
                        <span style={{ fontSize: 11, fontWeight: 700, width: 28, flexShrink: 0, color: h.closed ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.75)' }}>{label}</span>
                        {h.closed ? (
                            <span style={{ fontSize: 11, color: 'rgba(239,68,68,0.5)' }}>Closed</span>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
                                {['open', 'close'].map(field => (
                                    <input key={field} type="time" value={h[field]} onChange={e => update(key, field, e.target.value)}
                                        style={{ flex: 1, padding: '5px 8px', borderRadius: 8, fontSize: 11, color: '#fff', outline: 'none', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.border}`, fontFamily: 'inherit' }} />
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ─── LANGUAGE PICKER ─────────────────────────────────────────────────────────

function LanguagePicker({ selected, onChange }) {
    const toggle = (lang) => onChange(selected.includes(lang) ? selected.filter(l => l !== lang) : [...selected, lang]);
    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {LANGUAGE_OPTIONS.map(lang => {
                const active = selected.includes(lang);
                return (
                    <button key={lang} type="button" onClick={() => toggle(lang)}
                        style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 20, cursor: 'pointer', transition: 'all .15s', border: `1px solid ${active ? 'rgba(29,158,117,0.6)' : C.border}`, background: active ? 'rgba(29,158,117,0.2)' : 'rgba(255,255,255,0.04)', color: active ? C.glow : C.muted }}>
                        {lang}
                    </button>
                );
            })}
        </div>
    );
}

// ─── LIVE PREVIEW ─────────────────────────────────────────────────────────────

function PreviewCard({ form, hours }) {
    const timingsAuto = buildTimingsText(hours);
    return (
        <div style={{ borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(142,240,204,0.2)', background: 'rgba(29,158,117,0.05)', backdropFilter: 'blur(14px)' }}>
            <div style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(29,158,117,0.12)', borderBottom: '1px solid rgba(142,240,204,0.12)' }}>
                <Eye size={13} color={C.glow} />
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: C.glow }}>Live Preview</span>
            </div>
            <div style={{ padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, background: 'rgba(29,158,117,0.18)', border: '1px solid rgba(29,158,117,0.35)' }}>🩺</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#fff', margin: 0 }}>{form.name || <span style={{ color: C.muted }}>Doctor Name</span>}</p>
                        <p style={{ fontSize: 11, color: C.glow, margin: '2px 0 0' }}>{form.specialty || 'Specialty'}</p>
                        {form.qualification && <p style={{ fontSize: 10, color: C.muted, margin: '2px 0 0' }}>{form.qualification}</p>}
                        {form.clinic_name && <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>🏥 {form.clinic_name}</p>}
                    </div>
                    {form.rating && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 8, flexShrink: 0, background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                            <Star size={11} color="#facc15" fill="#facc15" />
                            <span style={{ fontSize: 11, fontWeight: 700, color: '#facc15' }}>{form.rating}</span>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                    {(form.address || form.city) && <div style={{ display: 'flex', gap: 6 }}><MapPin size={11} style={{ flexShrink: 0, marginTop: 1, color: 'rgba(255,255,255,0.25)' }} /><span>{[form.address, form.city, form.pincode].filter(Boolean).join(', ')}</span></div>}
                    {form.phone && <div style={{ display: 'flex', gap: 6 }}><Phone size={11} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.25)' }} /><span>{form.phone}</span></div>}
                    {(form.timings || timingsAuto) && <div style={{ display: 'flex', gap: 6 }}><Clock size={11} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.25)' }} /><span>{form.timings || timingsAuto}</span></div>}
                    {form.experience && <div style={{ display: 'flex', gap: 6 }}><Award size={11} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.25)' }} /><span>{form.experience}</span></div>}
                    {form.fees && <div style={{ display: 'flex', gap: 6 }}><IndianRupee size={11} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.25)' }} /><span>₹{form.fees} consultation</span></div>}
                    {form.languages?.length > 0 && <div style={{ display: 'flex', gap: 6 }}><Languages size={11} style={{ flexShrink: 0, color: 'rgba(255,255,255,0.25)' }} /><span>{form.languages.join(', ')}</span></div>}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
                    {form.is_verified && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(29,158,117,0.2)', color: C.glow, border: '1px solid rgba(29,158,117,0.35)' }}>✓ Verified</span>}
                    {form.is_featured && <span style={{ fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 20, background: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)' }}>⭐ Featured</span>}
                </div>
            </div>
        </div>
    );
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function Toast({ t }) {
    if (!t) return null;
    const ok = t.type === 'success';
    return (
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 999, display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 16px', borderRadius: 16, maxWidth: 320, backdropFilter: 'blur(20px)', background: ok ? 'rgba(29,158,117,0.95)' : 'rgba(239,68,68,0.93)', border: `1px solid ${ok ? 'rgba(142,240,204,0.4)' : 'rgba(239,68,68,0.4)'}`, boxShadow: `0 8px 32px ${ok ? 'rgba(29,158,117,0.4)' : 'rgba(239,68,68,0.35)'}`, animation: 'dg-right .3s ease' }}>
            {ok ? <CheckCircle2 size={18} color="#fff" style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertCircle size={18} color="#fff" style={{ flexShrink: 0, marginTop: 1 }} />}
            <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{ok ? 'Doctor Added!' : 'Error'}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', margin: '3px 0 0' }}>{t.msg}</p>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AddDoctorPage() {
    const [form, setForm] = useState(EMPTY);
    const [hours, setHours] = useState(DEFAULT_HOURS);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState(null);
    const [preview, setPreview] = useState(true);

    // Generic field updater
    const f = useCallback((key) => (e) => {
        const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm(p => ({ ...p, [key]: v }));
        setErrors(p => ({ ...p, [key]: '' }));
    }, []);

    // ── Called when user selects a Google Places suggestion ──────────────────
    //    Fills address, area, city, state, pincode, lat, lng, maps_url at once.
    const handlePlaceSelect = useCallback((data) => {
        if (!data) return;
        setForm(p => ({
            ...p,
            address: data.address || p.address,
            area: data.area || p.area,
            city: data.city || p.city,
            state: data.state || p.state,
            pincode: data.pincode || p.pincode,
            lat: data.lat || p.lat,
            lng: data.lng || p.lng,
            maps_url: data.maps_url || p.maps_url,
        }));
        // Clear location-related errors
        setErrors(p => ({ ...p, pincode: '', lat: '', lng: '' }));
    }, []);

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Doctor name is required';
        if (!form.specialty) e.specialty = 'Please select a specialty';
        if (!form.phone.trim()) e.phone = 'Phone number is required';
        else if (!/^[+\d\s\-(). ]{7,16}$/.test(form.phone)) e.phone = 'Invalid phone number';
        if (!form.pincode.trim()) e.pincode = 'Pincode is required';
        else if (!/^\d{6}$/.test(form.pincode)) e.pincode = 'Must be 6 digits';
        if (form.fees && isNaN(+form.fees)) e.fees = 'Must be a number';
        if (form.rating && (isNaN(+form.rating) || +form.rating > 5)) e.rating = '0–5 only';
        if (form.lat && isNaN(+form.lat)) e.lat = 'Invalid latitude';
        if (form.lng && isNaN(+form.lng)) e.lng = 'Invalid longitude';
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
        return e;
    };

    const showToast = (type, msg) => { setToast({ type, msg }); setTimeout(() => setToast(null), 4500); };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (ev) => {
        ev.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length) { setErrors(errs); showToast('error', 'Fix highlighted fields before saving.'); return; }

        setLoading(true);
        try {
            const hoursJson = buildHoursJson(hours);
            const autoTimings = form.timings.trim() || buildTimingsText(hours);

            const payload = {
                name: form.name.trim(),
                specialty: form.specialty,
                qualification: form.qualification.trim() || null,
                experience: form.experience.trim() || null,
                gender: form.gender || null,
                languages: form.languages.length ? form.languages : null,
                clinic_name: form.clinic_name.trim() || null,
                address: form.address.trim() || null,
                area: form.area.trim() || null,
                city: form.city.trim() || null,
                state: form.state || 'West Bengal',
                pincode: form.pincode.trim(),
                lat: form.lat ? +form.lat : null,
                lng: form.lng ? +form.lng : null,
                phone: form.phone.trim(),
                phone2: form.phone2.trim() || null,
                email: form.email.trim() || null,
                website: form.website.trim() || null,
                maps_url: form.maps_url.trim() || null,
                profile_url: form.profile_url.trim() || null,
                fees: form.fees ? +form.fees : null,
                rating: form.rating ? +form.rating : null,
                reviews: form.reviews ? +form.reviews : 0,
                timings: autoTimings || null,
                hours: hoursJson,
                is_active: true,
                is_verified: form.is_verified,
                is_featured: form.is_featured,
            };

            const { data, error } = await supabase
                .from('doctors_master')
                .insert([payload])
                .select('id, name')
                .single();

            if (error) throw error;

            showToast('success', `${data.name} saved! ID: ${data.id.slice(0, 8)}…`);
            setForm(EMPTY);
            setHours(DEFAULT_HOURS);
            setErrors({});

        } catch (err) {
            console.error('[AddDoctor]', err);
            showToast('error', err.message || 'Supabase insert failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => { setForm(EMPTY); setHours(DEFAULT_HOURS); setErrors({}); };

    // ── RENDER ────────────────────────────────────────────────────────────────

    return (
        <>
            <style>{`
                @keyframes dg-up    { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
                @keyframes dg-right { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
                @keyframes spin     { to { transform: rotate(360deg); } }
                * { box-sizing: border-box; }
                input[type="time"]::-webkit-calendar-picker-indicator { filter: invert(.6); }
                select option { background: #0d1f2d; }
                /* hide Google Places branding bar that can overlap our UI */
                .pac-container { z-index: 9999 !important; border-radius: 12px; overflow: hidden; border: 1px solid rgba(142,240,204,0.25); background: #0d1f2d; box-shadow: 0 12px 40px rgba(0,0,0,0.5); }
                .pac-item       { padding: 8px 14px; font-size: 12px; color: rgba(255,255,255,0.75); border-color: rgba(255,255,255,0.07); cursor: pointer; }
                .pac-item:hover { background: rgba(29,158,117,0.15); }
                .pac-item-query { color: #fff; font-weight: 600; }
                .pac-matched    { color: #8EF0CC; }
                .pac-icon       { filter: invert(.5) sepia(1) hue-rotate(120deg); }
            `}</style>

            <Toast t={toast} />

            <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
                <div style={{ maxWidth: 780, margin: '0 auto', padding: '24px 16px' }}>

                    {/* PAGE HEADER */}
                    <div style={{ marginBottom: 20, animation: 'dg-up .3s ease' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 20, marginBottom: 10, fontSize: 10, fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', background: 'rgba(29,158,117,0.12)', border: '1px solid rgba(29,158,117,0.3)', color: C.glow }}>
                                    <Plus size={11} /> Add New Doctor
                                </div>
                                <h1 style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: 0, lineHeight: 1.1 }}>Doctor Registration</h1>
                                <p style={{ fontSize: 13, color: C.muted, marginTop: 6 }}>Fill in all details to add a verified doctor to Daanguru's database.</p>
                            </div>
                            <button type="button" onClick={() => setPreview(v => !v)}
                                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, color: C.muted }}>
                                {preview ? <EyeOff size={13} /> : <Eye size={13} />}
                                {preview ? 'Hide' : 'Show'} Preview
                            </button>
                        </div>
                    </div>

                    {/* LIVE PREVIEW */}
                    {preview && (
                        <div style={{ marginBottom: 16, animation: 'dg-up .35s ease' }}>
                            <PreviewCard form={form} hours={hours} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate>

                        {/* ══ 1. BASIC INFO ══ */}
                        <SectionCard delay={50}>
                            <SectionHead icon={User} label="Basic Information" sub="Name, specialty, qualifications and experience" />
                            <Grid cols={2}>
                                <Col span={2}>
                                    <Field label="Full Name" required error={errors.name}>
                                        <Input value={form.name} onChange={f('name')} placeholder="Dr. Priya Sharma" error={errors.name} />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Specialty" required error={errors.specialty}>
                                        <Select value={form.specialty} onChange={f('specialty')} options={SPECIALTIES} placeholder="Select specialty" error={errors.specialty} />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Gender">
                                        <Select value={form.gender} onChange={f('gender')} options={['Male', 'Female', 'Other']} placeholder="Select gender" />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Experience" hint="e.g. '12 years' or 'Since 2011'">
                                        <Input value={form.experience} onChange={f('experience')} placeholder="12 years" />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Qualification" hint="e.g. MBBS, MD (Internal Medicine)">
                                        <Input value={form.qualification} onChange={f('qualification')} placeholder="MBBS, MD" />
                                    </Field>
                                </Col>
                                <Col span={2}>
                                    <Field label="Languages Spoken">
                                        <div style={{ marginTop: 4 }}>
                                            <LanguagePicker selected={form.languages} onChange={langs => setForm(p => ({ ...p, languages: langs }))} />
                                        </div>
                                    </Field>
                                </Col>
                            </Grid>
                        </SectionCard>

                        {/* ══ 2. CLINIC ══ */}
                        <SectionCard delay={90}>
                            <SectionHead icon={Building2} label="Clinic & Location" sub="Clinic name, full address, city, state and pincode" />
                            <Grid cols={2}>
                                <Col span={2}>
                                    <Field label="Clinic / Hospital Name">
                                        <Input value={form.clinic_name} onChange={f('clinic_name')} placeholder="Sharma Multispeciality Clinic" />
                                    </Field>
                                </Col>
                                <Col span={2}>
                                    <Field label="Full Address">
                                        <Textarea value={form.address} onChange={f('address')} placeholder="12 Station Road, Near Central Park, Jhargram" rows={2} />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Area / Locality">
                                        <Input value={form.area} onChange={f('area')} placeholder="Station Road" />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="City / Town">
                                        <Input value={form.city} onChange={f('city')} placeholder="Jhargram" />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="State">
                                        <Select value={form.state} onChange={f('state')} options={STATES} placeholder="Select state" />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Pincode" required error={errors.pincode} hint="6-digit pincode">
                                        <Input value={form.pincode} onChange={f('pincode')} placeholder="721507" inputMode="numeric" maxLength={6} error={errors.pincode} />
                                    </Field>
                                </Col>
                            </Grid>
                        </SectionCard>

                        {/* ══ 3. GOOGLE PLACES LOCATION ══ */}
                        <SectionCard delay={130}>
                            <SectionHead icon={Navigation} label="Google Maps Location"
                                sub="Search clinic or address — auto-fills all location fields below" />

                            <Field label="Search on Google Maps" hint="">
                                <LocationAutocomplete
                                    onPlaceSelect={handlePlaceSelect}
                                    error={errors.location}
                                />
                            </Field>

                            {/* Read-only auto-filled fields */}
                            {(form.lat || form.lng || form.maps_url) && (
                                <div style={{ marginTop: 14 }}>
                                    <Grid cols={2}>
                                        <Col>
                                            <Field label="Latitude (auto)" error={errors.lat}>
                                                <Input value={form.lat} onChange={f('lat')} placeholder="22.4500" inputMode="decimal" error={errors.lat} />
                                            </Field>
                                        </Col>
                                        <Col>
                                            <Field label="Longitude (auto)" error={errors.lng}>
                                                <Input value={form.lng} onChange={f('lng')} placeholder="86.9833" inputMode="decimal" error={errors.lng} />
                                            </Field>
                                        </Col>
                                        <Col span={2}>
                                            <Field label="Maps URL (auto)">
                                                <Input value={form.maps_url} onChange={f('maps_url')} placeholder="https://maps.google.com/…" />
                                            </Field>
                                        </Col>
                                    </Grid>
                                </div>
                            )}
                        </SectionCard>

                        {/* ══ 4. CONTACT ══ */}
                        <SectionCard delay={170}>
                            <SectionHead icon={Phone} label="Contact Details" sub="Phone numbers, email, website and listing profile" />
                            <Grid cols={2}>
                                <Col>
                                    <Field label="Primary Phone" required error={errors.phone} hint="+91 98765 43210">
                                        <Input value={form.phone} onChange={f('phone')} placeholder="+91 98765 43210" type="tel" error={errors.phone} />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Alternate Phone" hint="Optional second number">
                                        <Input value={form.phone2} onChange={f('phone2')} placeholder="+91 70001 23456" type="tel" />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Email" error={errors.email}>
                                        <Input value={form.email} onChange={f('email')} placeholder="doctor@clinic.com" type="email" error={errors.email} />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Website" hint="Clinic or personal site">
                                        <Input value={form.website} onChange={f('website')} placeholder="https://clinicname.com" type="url" />
                                    </Field>
                                </Col>
                                <Col span={2}>
                                    <Field label="Profile URL" hint="Practo, Justdial, Lybrate, or other listing page">
                                        <Input value={form.profile_url} onChange={f('profile_url')} placeholder="https://practo.com/doctor/..." type="url" />
                                    </Field>
                                </Col>
                            </Grid>
                        </SectionCard>

                        {/* ══ 5. FEES & RATING ══ */}
                        <SectionCard delay={210}>
                            <SectionHead icon={IndianRupee} label="Fees, Rating & Status" sub="Consultation charges, patient rating and listing flags" />
                            <Grid cols={2}>
                                <Col>
                                    <Field label="Consultation Fees (₹)" error={errors.fees}>
                                        <Input value={form.fees} onChange={f('fees')} placeholder="250" inputMode="numeric" error={errors.fees} />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Rating (0–5)" error={errors.rating}>
                                        <Input value={form.rating} onChange={f('rating')} placeholder="4.5" inputMode="decimal" error={errors.rating} />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Number of Reviews">
                                        <Input value={form.reviews} onChange={f('reviews')} placeholder="48" inputMode="numeric" />
                                    </Field>
                                </Col>
                                <Col>
                                    <Field label="Flags">
                                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                                            <Toggle checked={form.is_verified} onChange={v => setForm(p => ({ ...p, is_verified: v }))} label="✓ Verified" />
                                            <Toggle checked={form.is_featured} onChange={v => setForm(p => ({ ...p, is_featured: v }))} label="⭐ Featured" />
                                        </div>
                                    </Field>
                                </Col>
                            </Grid>
                        </SectionCard>

                        {/* ══ 6. CLINIC HOURS ══ */}
                        <SectionCard delay={250}>
                            <SectionHead icon={Clock} label="Clinic Hours" sub="Set weekly schedule — auto-generates hours JSON and timings text" />
                            <HoursBuilder hours={hours} onChange={setHours} />
                            <div style={{ marginTop: 14 }}>
                                <Field label="Override Timings Text" hint="Leave blank to auto-generate from schedule above">
                                    <Input value={form.timings} onChange={f('timings')} placeholder="Mon–Sat: 10am–2pm, 5pm–8pm (auto if blank)" />
                                </Field>
                                {!form.timings && buildTimingsText(hours) && (
                                    <div style={{ marginTop: 6, fontSize: 10, padding: '5px 10px', borderRadius: 8, background: 'rgba(29,158,117,0.08)', color: 'rgba(142,240,204,0.6)', border: '1px solid rgba(29,158,117,0.18)' }}>
                                        Auto-generated: {buildTimingsText(hours)}
                                    </div>
                                )}
                            </div>
                        </SectionCard>

                        {/* ══ ACTIONS ══ */}
                        <div style={{ display: 'flex', gap: 10, animation: 'dg-up .45s ease 300ms both' }}>
                            <button type="button" onClick={handleReset}
                                style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '12px 18px', borderRadius: 14, fontSize: 12, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', background: 'rgba(255,255,255,0.05)', border: `1px solid ${C.border}`, color: C.muted }}>
                                <RotateCcw size={14} /> Reset
                            </button>
                            <button type="submit" disabled={loading}
                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px 24px', borderRadius: 14, fontSize: 14, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', color: '#fff', border: 'none', transition: 'all .2s', background: loading ? 'rgba(29,158,117,0.4)' : 'linear-gradient(135deg,#1D9E75,#0a5940)', boxShadow: loading ? 'none' : '0 6px 28px rgba(29,158,117,0.45)', opacity: loading ? .7 : 1 }}>
                                {loading
                                    ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Saving to Supabase…</>
                                    : <><Send size={15} /> Add Doctor to Database</>
                                }
                            </button>
                        </div>

                        <p style={{ textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.2)', marginTop: 14 }}>
                            Fields marked <span style={{ color: '#f87171', fontWeight: 900 }}>*</span> are required.
                            Data saved to <code style={{ color: 'rgba(142,240,204,0.5)' }}>doctors_master</code> in Supabase.
                        </p>

                    </form>
                </div>
            </div>
        </>
    );
}