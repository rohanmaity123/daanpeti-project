import { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlacesAutocomplete } from '../hooks/usePlacesAutocomplete';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? '';


export function LocationAutocomplete({ value, onChange, onPlaceSelect, error, placeholder = 'Search city, area, or pincode...' }) {
  const { suggestions, getPlacePredictions, getPlaceDetails, clearSuggestions, loading, ready } = usePlacesAutocomplete(API_KEY);
  const [open, setOpen] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [selected, setSelected] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleInput = (e) => {
    const v = e.target.value;
    onChange(v);
    setSelected(false);
    if (v.length >= 2) {
      getPlacePredictions(v);
      setOpen(true);
    } else {
      clearSuggestions();
      setOpen(false);
    }
  };

  const handleSelect = async (placeId, fullText) => {
    onChange(fullText);
    setSelected(true);
    setOpen(false);
    clearSuggestions();

    setFetching(true);
    try {
      const details = await getPlaceDetails(placeId);
      onPlaceSelect(details);
    } catch {
      /* fallback — just keep the typed text */
    } finally {
      setFetching(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setSelected(false);
    clearSuggestions();
    setOpen(false);
    inputRef.current?.focus();
  };

  const showDropdown = open && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative">
      {/* Input */}
      <div className={`flex items-center  rounded-xl border bg-card transition-shadow ${error ? 'border-destructive ring-1 ring-destructive' : 'border-input focus-within:ring-2 focus-within:ring-ring'
        }`}>
        <div className="pl-3 shrink-0">
          {fetching || loading
            ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            : <MapPin className={`h-4 w-4 ${selected ? 'text-primary' : 'text-muted-foreground'}`} />
          }
        </div>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInput}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          placeholder={!ready ? 'Loading...' : placeholder}
          disabled={!ready}
          className="flex-1 px-2.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent disabled:opacity-50"
        />
        {value && (
          <button type="button" onClick={handleClear} className="pr-3 text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Selected confirmation badge */}
      <AnimatePresence>
        {selected && value && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: '#138808' }}>
            <MapPin className="h-3 w-3" />
            Location confirmed ✓
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-1.5 z-[9999] rounded-2xl border border-white/20 overflow-hidden backdrop-blur-xl backdrop-saturate-150 bg-white/10"
            style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}
          >
            {/* Powered by Google */}
            <div className="flex items-center justify-between px-3 py-2 border-b border-border">
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1">
                <Search className="h-3 w-3" />Searching India
              </span>
              <span className="text-[10px] text-muted-foreground">Powered by Google</span>
            </div>

            {suggestions.map((s, i) => (
              <motion.button
                key={s.placeId}
                type="button"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                onClick={() => handleSelect(s.placeId, s.fullText)}
                className="w-full flex items-start gap-3 px-3 py-3 text-left hover:bg-muted/60 transition-colors border-b border-border/50 last:border-b-0"
              >
                <div className="mt-0.5 h-7 w-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(19,136,8,0.08)' }}>
                  <MapPin className="h-3.5 w-3.5" style={{ color: '#ef9f27' }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">{s.mainText}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.secondaryText}</p>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* No API key warning in dev */}
      {!API_KEY && import.meta.env.DEV && (
        <p className="mt-1 text-xs text-amber-600 font-medium">
          ⚠ Add VITE_GOOGLE_MAPS_API_KEY to .env to enable autocomplete
        </p>
      )}
    </div>
  );
}
