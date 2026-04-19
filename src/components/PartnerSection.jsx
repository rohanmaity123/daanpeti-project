import { ExternalLink } from 'lucide-react';
import Lalpahari from '../assets/images/lalpahari.png';
import Alochhayaa from '../assets/images/allochhaya.jpeg';
import Basu from '../assets/images/basu.jpeg';

const partners = [
    {
        name: 'Vai Vai Shoes Center',
        description: 'Heritage-driven community welfare initiatives',
        icon: Basu,
        url: '#',
    },
    {
        name: 'lalpaharirdesh.in',
        description: 'Rural empowerment through digital outreach',
        icon: Lalpahari,
        url: 'https://lalpaharirdesh.in',
    },
    {
        name: 'Allochhaya Microfinance',
        description: 'Financial inclusion for underserved communities',
        icon: Alochhayaa,
        url: '#',
    },
];

export function PartnersSection() {
    return (
        <section className="mx-4 lg:mx-0 mt-10 mb-6">
            {/* Heading */}
            <div className="text-center mb-8">
                <h2 className="text-xl lg:text-2xl font-extrabold text-foreground">
                    Our Trusted Partners 🤝
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground font-medium">
                    Working together to create impact
                </p>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 max-w-4xl mx-auto">
                {partners.map((partner, i) => {
                    const Icon = partner.icon;
                    return (
                        <div
                            key={partner.name}
                            className="group relative rounded-2xl border border-border/50 bg-card/80 backdrop-blur-md p-6 text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-lg hover:border-primary/30"
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            {/* Icon */}
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                                <img
                                    src={partner.icon}
                                    alt={`${partner.name} logo`}
                                    className="h-8 w-8 object-contain rounded-lg"
                                />
                            </div>

                            <h3 className="text-base font-bold text-foreground">{partner.name}</h3>
                            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                {partner.description}
                            </p>

                            {partner.url && partner.url !== '#' && (
                                <a
                                    href={partner.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                                >
                                    Visit Website <ExternalLink className="h-3 w-3" />
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
