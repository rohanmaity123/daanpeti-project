import { MapPin, Navigation, ExternalLink, Car } from 'lucide-react';

export function LocationCard({ location, pincode }) {
    const query = encodeURIComponent(`${location}, ${pincode}, India`);
    const embedUrl = `https://www.google.com/maps?q=${query}&output=embed`;
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`;
    const openMapUrl = `https://www.google.com/maps/search/?api=1&query=${query}`;

    return (
        <div className="rounded-2xl border border-border bg-card/70 backdrop-blur-md shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Map */}
            <div className="relative aspect-[16/9] w-full bg-muted">
                <iframe
                    title={`Map of ${location}`}
                    src={embedUrl}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 h-full w-full border-0"
                    allowFullScreen
                />
                {/* Fallback */}
                <noscript>
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        Map could not be loaded.
                    </div>
                </noscript>

                {/* Floating pin badge */}
                <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-card/90 backdrop-blur-md px-2.5 py-1 text-[11px] font-bold text-primary shadow">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    Pickup Location
                </div>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary">
                        <MapPin className="h-5 w-5 text-primary" style={{ color: "#ef9f27" }} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Pickup Location
                        </p>
                        <p className="text-sm font-bold text-foreground truncate">{location}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Car className="h-3 w-3" />
                            Pincode {pincode}
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                        href={directionsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground shadow-sm transition-all hover:opacity-90 hover:scale-[1.02] active:scale-[0.99]"
                    >
                        <Navigation className="h-4 w-4" />
                        Get Directions 🚀
                    </a>
                    <a
                        href={openMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card py-3 px-4 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:scale-[1.02] active:scale-[0.99]"
                    >
                        <ExternalLink className="h-4 w-4" />
                        Open in Maps
                    </a>
                </div>
            </div>
        </div>
    );
}
