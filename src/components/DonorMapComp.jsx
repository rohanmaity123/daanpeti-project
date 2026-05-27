import { useEffect, useState, useCallback, useRef } from 'react';
import { Droplets, RefreshCw } from 'lucide-react';
import { supabase } from '../utils/supabaseClient';

/* ─── Constants ──────────────────────────────────────────────────────────── */

const BLOOD_GROUPS = ['All', 'A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const BG_COLORS = {
    'A+': '#E24B4A',
    'A-': '#c0392b',
    'B+': '#e67e22',
    'B-': '#d35400',
    'AB+': '#2980b9',
    'AB-': '#1a6fa8',
    'O+': '#138808',
    'O-': '#0e6e06',
    'All': '#E24B4A',
};

// West Bengal bounding box — map is locked inside this
const WB_BOUNDS = [[21.4, 85.7], [27.6, 89.9]];


/* ─── Leaflet CSS injection ───────────────────────────────────────────────── */

const POPUP_STYLE = `
  .blood-popup .leaflet-popup-content-wrapper {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    border-radius: 14px !important;
    overflow: visible !important;
  }
  .blood-popup .leaflet-popup-content {
    margin: 0 !important;
    width: auto !important;
  }
  .blood-popup .leaflet-popup-tip-container { display: none !important; }
  .leaflet-container { background: #0b0b10 !important; font-family: 'Segoe UI', sans-serif !important; }
  .leaflet-control-zoom a {
    background: rgba(255,255,255,0.07) !important;
    color: rgba(255,255,255,0.6) !important;
    border-color: rgba(255,255,255,0.1) !important;
  }
  .leaflet-control-zoom a:hover {
    background: rgba(255,255,255,0.14) !important;
    color: #fff !important;
  }
  .leaflet-control-attribution {
    background: rgba(0,0,0,0.45) !important;
    color: rgba(255,255,255,0.25) !important;
    font-size: 9px !important;
  }
  .leaflet-control-attribution a { color: rgba(255,255,255,0.35) !important; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse-ring {
    0%   { transform: scale(1);   opacity:.5; }
    100% { transform: scale(1.7); opacity:0; }
  }
`;

/* ─── Main Component ──────────────────────────────────────────────────────── */

export default function WestBengalBloodMap({ onCitySelect }) {
    const mapRef = useRef(null);
    const leafletMap = useRef(null);
    const markersLayer = useRef(null);
    const resizeObs = useRef(null);

    const [selectedBG, setSelectedBG] = useState('All');
    const [cityData, setCityData] = useState({});
    const [loading, setLoading] = useState(true);
    const [leafletReady, setLeafletReady] = useState(false);

    /* ── Load Leaflet once ── */
    useEffect(() => {
        if (document.getElementById('leaflet-css')) {
            if (window.L) { setLeafletReady(true); return; }
        }
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        const style = document.createElement('style');
        style.id = 'blood-map-style';
        style.textContent = POPUP_STYLE;
        document.head.appendChild(style);

        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => setLeafletReady(true);
        document.head.appendChild(script);

        return () => { };
    }, []);

    /* ── Fetch donor counts ── */
    const fetchCounts = useCallback(async (bg) => {
        setLoading(true);
        setCityData({});   // clear stale data immediately

        let query = supabase
            .from('blood_group_distribution')
            .select('city,blood_group_counts,latitude,longitude,total_donors')


        // if (bg !== 'All') query = query.eq('blood_group', bg);

        const { data, error } = await query;

        if (error || !data) {
            setLoading(false);
            return;
        }

        const agg = {};
        data?.forEach(row => {
            if (!row.city) return;

            // const k = cityKey(row.city);
            // let newData = {}

            agg[row.city] = {
                display: row.city.trim().replace(/\b\w/g, c => c.toUpperCase()),
                total: row?.total_donors || 0,
                bgBreakdown: row?.blood_group_counts || {},
                lat: Number(row?.latitude),
                lng: Number(row?.longitude),
            };
        });
        setCityData(agg);
        setLoading(false);
    }, []);

    useEffect(() => { fetchCounts(selectedBG); }, [selectedBG, fetchCounts]);

    /* ── Init map ── */
    useEffect(() => {
        if (!leafletReady || !mapRef.current || leafletMap.current) return;
        const L = window.L;

        const bounds = L.latLngBounds(WB_BOUNDS);

        leafletMap.current = L.map(mapRef.current, {
            center: [23.8, 87.9],
            zoom: 7,
            minZoom: 6,
            maxZoom: 13,
            maxBounds: bounds,
            maxBoundsViscosity: 1.0,
            zoomControl: true,
            scrollWheelZoom: true,
            attributionControl: true,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap &copy; CARTO',
            subdomains: 'abcd',
            maxZoom: 19,
        }).addTo(leafletMap.current);

        // Subtle district-name label layer on top
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
            subdomains: 'abcd',
            maxZoom: 19,
            opacity: 0.4,
        }).addTo(leafletMap.current);

        markersLayer.current = L.layerGroup().addTo(leafletMap.current);

        // Responsive: invalidate map size when container resizes
        resizeObs.current = new ResizeObserver(() => {
            leafletMap.current?.invalidateSize();
        });
        resizeObs.current.observe(mapRef.current);

        return () => resizeObs.current?.disconnect();
    }, [leafletReady]);

    /* ── Draw markers ── */
    useEffect(() => {
        if (!leafletReady || !leafletMap.current || loading) return;
        if (Object.keys(cityData).length === 0) { markersLayer.current?.clearLayers(); return; }
        const L = window.L;
        const grp = markersLayer.current;
        grp.clearLayers();

        const accentColor = BG_COLORS[selectedBG];
        const entries = Object.entries(cityData);
        const maxTotal = Math.max(...entries.map(([, v]) => v.total), 1);

        entries.forEach(([key, data]) => {

            const {
                display,
                total,
                bgBreakdown,
                lat,
                lng
            } = data;

            const coords = [lat, lng];
            if (!coords) return;

            // Top blood group
            const sorted = BLOOD_GROUPS
                .filter(bg => bg !== 'All' && bgBreakdown[bg])
                .map(bg => [bg, bgBreakdown[bg]])
                .sort(([, a], [, b]) => b - a);

            const topBG = sorted[0];
            const markerColor = topBG ? BG_COLORS[topBG[0]] : accentColor;

            // Radius: 14 → 40 px
            const radius = 14 + Math.round((total / maxTotal) * 26);

            // ALL blood groups in popup rows
            const rowsHtml = sorted.map(([bg, cnt]) => {
                const c = BG_COLORS[bg];
                const pct = Math.round((cnt / total) * 100);
                return `
                  <div style="display:flex;align-items:center;gap:7px;margin:3px 0;">
                    <span style="
                      background:${c}25;color:${c};border-radius:6px;
                      padding:2px 6px;font-size:10px;font-weight:900;
                      min-width:30px;text-align:center;flex-shrink:0;">
                      ${bg}
                    </span>
                    <div style="flex:1;height:5px;background:rgba(255,255,255,0.07);border-radius:3px;overflow:hidden;">
                      <div style="width:${pct}%;height:100%;background:${c};border-radius:3px;opacity:.85;"></div>
                    </div>
                    <span style="color:${c};font-size:10px;font-weight:700;min-width:20px;text-align:right;flex-shrink:0;">${cnt}</span>
                  </div>`;
            }).join('');

            const noDataHtml = sorted.length === 0
                ? `<p style="color:rgba(255,255,255,.3);font-size:11px;margin:6px 0;">No breakdown data</p>`
                : '';

            const popupHtml = `
              <div style="
                font-family:'Segoe UI',sans-serif;
                background:#0f0f16;
                border-radius:14px;
                padding:13px 15px 11px;
                min-width:200px;max-width:240px;
                border:1px solid ${markerColor}40;
                box-shadow:0 8px 32px rgba(0,0,0,.6);">
                <p style="margin:0 0 1px;font-size:14px;font-weight:900;color:#fff;">${display}</p>
                <p style="margin:0 0 10px;font-size:11px;color:rgba(255,255,255,.4);">
                  <span style="color:${markerColor};font-size:20px;font-weight:900;">${total}</span>
                  &nbsp;available donors
                </p>
                ${rowsHtml}${noDataHtml}
                <button
                  onclick="window.__bloodMapSelect('${key}','${display}')"
                  style="
                    margin-top:11px;width:100%;
                    background:${markerColor};color:#fff;border:none;
                    border-radius:9px;padding:7px 0;
                    font-size:11px;font-weight:800;cursor:pointer;
                    box-shadow:0 3px 10px ${markerColor}55;letter-spacing:.3px;">
                  Find Donors in ${display} →
                </button>
              </div>`;

            // Pulsing circle icon
            const icon = L.divIcon({
                className: '',
                html: `
                  <div style="position:relative;width:${radius * 2}px;height:${radius * 2}px;">
                    <div style="
                      position:absolute;inset:0;border-radius:50%;
                      background:${markerColor};opacity:.25;
                      animation:pulse-ring 2s ease-out infinite;"></div>
                    <div style="
                      position:absolute;inset:3px;border-radius:50%;
                      background:${markerColor};
                      border:2px solid rgba(255,255,255,.28);
                      box-shadow:0 0 0 3px ${markerColor}30,0 3px 10px ${markerColor}55;
                      display:flex;flex-direction:column;
                      align-items:center;justify-content:center;cursor:pointer;">
                      <span style="color:#fff;font-size:${total >= 100 ? 8 : 9}px;font-weight:900;line-height:1;">${total}</span>
                      <span style="color:rgba(255,255,255,.8);font-size:7px;line-height:1;margin-top:1px;">${topBG ? topBG[0] : '🩸'}</span>
                    </div>
                  </div>`,
                iconSize: [radius * 2, radius * 2],
                iconAnchor: [radius, radius],
                popupAnchor: [0, -(radius + 4)],
            });

            L.marker(coords, { icon })
                .bindPopup(popupHtml, {
                    className: 'blood-popup',
                    maxWidth: 250,
                    closeButton: true,
                })
                .addTo(grp);
        });

        window.__bloodMapSelect = (key, display) => {
            if (onCitySelect) onCitySelect(display);
        };
    }, [cityData, selectedBG, loading, leafletReady, onCitySelect]);

    const grandTotal = Object.values(cityData).reduce((s, c) => s + c.total, 0);
    const accentColor = BG_COLORS[selectedBG];
    const topCity = Object.entries(cityData).sort(([, a], [, b]) => b.total - a.total)[0];

    return (
        <div style={{ width: '100%', boxSizing: 'border-box', padding: '0 0 16px' }}>

            {/* Header */}
            <div style={{ padding: '16px 16px 0' }}>
                <p style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: 3,
                    color: accentColor, textTransform: 'uppercase', margin: '0 0 3px',
                }}>Live · West Bengal</p>
                <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '0 0 3px' }}>
                    Blood Donors Map
                </h2>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,.4)', margin: '0 0 10px' }}>
                    Pin size = donor count · Pin colour = top blood group · Tap to expand
                </p>

                {/* Blood group filter */}
                {/* <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                    {BLOOD_GROUPS.map(bg => {
                        const c = BG_COLORS[bg];
                        const active = selectedBG === bg;
                        return (
                            <button key={bg} onClick={() => setSelectedBG(bg)} style={{
                                background: active ? c : `${c}1a`,
                                color: active ? '#fff' : c,
                                border: active ? 'none' : `1px solid ${c}44`,
                                borderRadius: 9, padding: '4px 10px',
                                fontSize: 11, fontWeight: 800, cursor: 'pointer',
                                boxShadow: active ? `0 2px 8px ${c}55` : 'none',
                                transition: 'all .15s',
                                flexShrink: 0,
                            }}>
                                {bg === 'All' ? '🩸 All' : bg}
                            </button>
                        );
                    })}
                </div> */}

                {/* Stats strip */}
                <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 0,
                    padding: '10px 14px', borderRadius: 12, marginBottom: 10,
                    background: `${accentColor}0f`, border: `1px solid ${accentColor}28`,
                }}>
                    <div style={{ paddingRight: 16, marginRight: 16, borderRight: '1px solid rgba(255,255,255,.08)' }}>
                        <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: accentColor }}>
                            {loading ? '…' : grandTotal}
                        </p>
                        <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
                            {selectedBG === 'All' ? 'Total Donors' : `${selectedBG} Donors`}
                        </p>
                    </div>
                    <div style={{ paddingRight: 16, marginRight: 16, borderRight: '1px solid rgba(255,255,255,.08)' }}>
                        <p style={{ margin: 0, fontSize: 22, fontWeight: 900, color: '#fff' }}>
                            {Object.keys(cityData).length}
                        </p>
                        <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,.4)' }}>Districts</p>
                    </div>
                    {topCity && !loading && (
                        <div>
                            <p style={{ margin: 0, fontSize: 16, fontWeight: 900, color: '#fff' }}>
                                {topCity[1].display}
                            </p>
                            <p style={{ margin: 0, fontSize: 10, color: 'rgba(255,255,255,.4)' }}>
                                Top district · {topCity[1].total} donors
                            </p>
                        </div>
                    )}
                    {loading && (
                        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <RefreshCw size={12} style={{ color: accentColor, animation: 'spin 1s linear infinite' }} />
                            <span style={{ fontSize: 11, color: 'rgba(255,255,255,.35)' }}>Fetching…</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Map */}
            <div style={{ padding: '0 16px', boxSizing: 'border-box' }}>
                <div style={{ position: 'relative', width: '100%', paddingBottom: '85%', borderRadius: 16, overflow: 'hidden' }}>
                    <div
                        ref={mapRef}
                        style={{
                            position: 'absolute', inset: 0,
                            borderRadius: 16,
                            border: '1px solid rgba(255,255,255,.08)',
                            background: '#0b0b10',
                        }}
                    />
                    {/* Loading overlay */}
                    {(loading || !leafletReady) && (
                        <div style={{
                            position: 'absolute', inset: 0, zIndex: 1000,
                            background: 'rgba(11,11,16,.8)',
                            borderRadius: 16,
                            display: 'flex', flexDirection: 'column',
                            alignItems: 'center', justifyContent: 'center', gap: 10,
                            backdropFilter: 'blur(6px)',
                        }}>
                            <Droplets size={30} style={{ color: accentColor, opacity: .7 }} />
                            <p style={{ color: 'rgba(255,255,255,.45)', fontSize: 13, margin: 0 }}>
                                {!leafletReady ? 'Loading map…' : 'Fetching donors…'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Legend */}
            <div style={{ padding: '10px 16px 0', display: 'flex', flexWrap: 'wrap', gap: '6px 12px', alignItems: 'center' }}>
                {BLOOD_GROUPS.filter(bg => bg !== 'All').map(bg => (
                    <div key={bg} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{
                            width: 9, height: 9, borderRadius: '50%',
                            background: BG_COLORS[bg],
                            boxShadow: `0 0 4px ${BG_COLORS[bg]}88`,
                            flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,.4)', fontWeight: 600 }}>{bg}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}