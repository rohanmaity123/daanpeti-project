import { useEffect, useRef, useState, useCallback } from 'react';

/* ── Script loader — uses loading=async to silence perf warning ── */
let scriptLoaded = false;
let scriptLoading = false;
const loadCallbacks = [];

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve) => {
    if (scriptLoaded) { resolve(); return; }
    loadCallbacks.push(resolve);
    if (scriptLoading) return;
    scriptLoading = true;

    /* Use importLibrary pattern — required for new Places API */
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async&libraries=places&language=en&region=IN`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      loadCallbacks.forEach(cb => cb());
      loadCallbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

/* ── Main hook ── */
export function usePlacesAutocomplete(apiKey) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const debounceRef = useRef(null);
  const sessionTokenRef = useRef(null);

  /* Load script + confirm new API is available */
  useEffect(() => {
    if (!apiKey) return;

    loadGoogleMapsScript(apiKey).then(() => {
      /* New Places API — AutocompleteSuggestion lives under google.maps.places */
      if (window.google?.maps?.places?.AutocompleteSuggestion) {
        /* Create a fresh session token for billing grouping */
        sessionTokenRef.current =
          new window.google.maps.places.AutocompleteSessionToken();
        setReady(true);
      } else {
        /* SDK loaded but new class not present — retry once after short delay
           (can happen if the library chunk hasn't finished executing yet)    */
        setTimeout(() => {
          if (window.google?.maps?.places?.AutocompleteSuggestion) {
            sessionTokenRef.current =
              new window.google.maps.places.AutocompleteSessionToken();
            setReady(true);
          }
        }, 800);
      }
    });
  }, [apiKey]);

  /* ── Fetch suggestions using new AutocompleteSuggestion API ── */
  const getPlacePredictions = useCallback((input) => {
    if (!ready || input.trim().length < 2) { setSuggestions([]); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const { suggestions: raw } =
          await window.google.maps.places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input,
            sessionToken: sessionTokenRef.current,
            includedRegionCodes: ['IN'],   /* restrict to India */
          });

        setSuggestions(
          (raw ?? []).slice(0, 5).map((s) => {
            const p = s.placePrediction;
            return {
              placeId: p.placeId,
              mainText: p.mainText?.text ?? p.text?.text ?? '',
              secondaryText: p.secondaryText?.text ?? '',
              fullText: p.text?.text ?? '',
            };
          })
        );
      } catch (err) {
        console.error('[AutocompleteSuggestion]', err);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [ready]);

  /* ── Fetch place details using new Place API ── */
  const getPlaceDetails = useCallback(async (placeId) => {
    /* Rotate session token after a place is selected (billing best-practice) */
    const usedToken = sessionTokenRef.current;
    sessionTokenRef.current =
      new window.google.maps.places.AutocompleteSessionToken();

    const place = new window.google.maps.places.Place({
      id: placeId,
      requestedLanguage: 'en',
    });

    await place.fetchFields({
      fields: ['formattedAddress', 'addressComponents', 'location', 'displayName'],
      sessionToken: usedToken,
    });

    /* Parse address components */
    const comps = place.addressComponents ?? [];
    const get = (type) =>
      comps.find((c) => c.types?.includes(type))?.longText ?? '';

    return {
      formattedAddress: place.formattedAddress ?? '',
      displayName: place.displayName ?? '',
      city: get('locality') || get('administrative_area_level_2'),
      state: get('administrative_area_level_1'),
      country: get('country'),
      pincode: get('postal_code'),
      lat: place.location?.lat() ?? null,
      lng: place.location?.lng() ?? null,
    };
  }, []);

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  return { ready, loading, suggestions, getPlacePredictions, getPlaceDetails, clearSuggestions };
}
