import { MapPin, Navigation, ExternalLink, Car } from 'lucide-react';

export function LocationCard({ location, pincode }) {
    const query = encodeURIComponent(`${location}, ${pincode}, India`);
    const embedUrl = `https://www.google.com/maps?q=${query}&output=embed`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    const openMapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    return (
        <div
            className="w-full rounded-[28px] overflow-hidden"
            style={{
                background: 'rgba(255,255,255,0.07)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.12)',
            }}
        >
            {/* ── Map embed ── */}
            <div className="relative w-full" style={{ paddingBottom: '52%' }}>
                <iframe
                    title={`Map of ${location}`}
                    src={embedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 h-full w-full border-0"
                    allowFullScreen
                />

                {/* Floating pin badge */}
                <div
                    className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold text-white"
                    style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)' }}
                >
                    <MapPin className="h-3.5 w-3.5 text-green-400" />
                    Pickup Location
                </div>
            </div>

            {/* ── Info + buttons ── */}
            <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                        style={{ background: 'rgba(239,159,39,0.15)', border: '1px solid rgba(239,159,39,0.25)' }}
                    >
                        <MapPin className="h-5 w-5" style={{ color: '#ef9f27' }} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                            Pickup Location
                        </p>
                        <p className="text-sm font-bold text-white truncate">{location}</p>
                        <p className="text-xs text-white/50 flex items-center gap-1 mt-0.5">
                            <Car className="h-3 w-3 shrink-0" />
                            Pincode {pincode}
                        </p>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-85 active:scale-[0.98]"
                        style={{ background: 'rgba(29,158,117,0.85)' }}
                    >
                        <Navigation className="h-4 w-4 shrink-0" />
                        Directions
                    </a>
                    <a
                        href={openMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/15 active:scale-[0.98]"
                        style={{ background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)' }}
                    >
                        <ExternalLink className="h-4 w-4 shrink-0" />
                        Open Maps
                    </a>
                </div>
            </div>
        </div>
    );
}
