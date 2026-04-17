import { useEffect, useState } from 'react';
import { FileText, UserCheck, Package, HandHeart, AlertTriangle, Scale, Globe, Gavel, Copyright, ShieldAlert, MapPin, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const sections = [
    {
        icon: FileText, num: '01', title: 'About DaanGuru',
        body: 'DaanGuru is a free, non-profit community platform that connects people who want to donate unused items with people who need them. We do not buy, sell, ship, or physically handle any items. We are only a platform — all exchanges happen directly between donors and recipients.',
    },
    {
        icon: UserCheck, num: '02', title: 'Eligibility',
        content: [
            'You must be 13 years of age or older to use DaanGuru',
            'You must provide accurate and truthful information',
            'Only one account per person is permitted',
            'Organisations and NGOs may register with a representative account',
        ],
    },
    {
        icon: Package, num: '03', title: 'Posting Items — Your Responsibilities',
        content: [
            'You must own or have the right to give away the item you post',
            'Items must be legal to give away under Indian law',
            'Items must be accurately described with real, recent photos',
            'No food, medicines, alcohol, weapons, animals, or live plants',
            'No counterfeit, stolen, or illegally obtained goods',
            'You are fully responsible for the safe and honest handover of items',
            'You agree to respond to genuine requests within a reasonable time',
            'Items that are no longer available must be marked as Claimed promptly',
        ],
    },
    {
        icon: HandHeart, num: '04', title: 'Claiming Items — Your Responsibilities',
        content: [
            'Only request items you genuinely need and intend to collect',
            'Arrange pickup promptly once the donor confirms — within 48 hours',
            'Treat donors with courtesy and respect at all times',
            'Do not resell items received from DaanGuru for commercial profit',
            'Do not claim items on behalf of someone else without their knowledge',
        ],
    },
    {
        icon: AlertTriangle, num: '05', title: 'Prohibited Content',
        intro: 'You must NOT post or share the following on DaanGuru:',
        content: [
            'Illegal items, controlled substances, or restricted goods',
            'Weapons, ammunition, explosives, or dangerous materials',
            'Adult, obscene, or sexually explicit content',
            'Spam, duplicate listings, or promotional/commercial content',
            'Misleading descriptions, fake photos, or false information',
            'Items you do not own or have no right to give away',
            'Content that discriminates based on religion, caste, gender, or race',
            'Any content that violates Indian law',
        ],
    },
    {
        icon: Scale, num: '06', title: "DaanGuru's Role & Limitations",
        body: "DaanGuru is only a platform connecting donors and recipients. We do not inspect, verify, or guarantee the condition of any donated item. We are not responsible for: the condition or accuracy of donated item descriptions; any disputes, conflicts, or disagreements between donors and recipients; any loss, damage, injury, or harm during or after the exchange; items not being available after being listed; or any communication that takes place on WhatsApp or other external platforms.",
    },
    {
        icon: Globe, num: '07', title: 'WhatsApp Communication',
        body: "When you share your WhatsApp number on DaanGuru, you explicitly consent to being contacted by interested users about your listed items. DaanGuru is not a party to, and is not responsible for, any communication, agreement, or dispute that occurs on WhatsApp. Please exercise caution and follow standard safety practices when meeting strangers for item exchange.",
    },
    {
        icon: Gavel, num: '08', title: 'Account Termination',
        body: "We reserve the right to suspend, restrict, or permanently delete accounts that: violate these Terms & Conditions; post prohibited content; engage in fraudulent, harmful, or abusive behaviour; repeatedly fail to honour claimed item commitments; or misuse the platform in any way. We will attempt to notify you before taking action, except in cases of serious violations.",
    },
    {
        icon: Copyright, num: '09', title: 'Intellectual Property',
        body: "The DaanGuru name, logo, tagline (Muft Mein Do, Muft Mein Lo), and overall design are our property and may not be used without written permission. Content you post on DaanGuru (photos, item descriptions) remains your property. However, by posting, you grant DaanGuru a non-exclusive, royalty-free licence to display, distribute, and promote your content on the platform and in promotional materials.",
    },
    {
        icon: ShieldAlert, num: '10', title: 'Limitation of Liability',
        body: "DaanGuru is a free community service provided as-is. To the maximum extent permitted by applicable Indian law, DaanGuru and its operators shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of the platform, including but not limited to losses arising from item exchanges, disputes with other users, or platform downtime.",
    },
    {
        icon: MapPin, num: '11', title: 'Governing Law & Jurisdiction',
        body: "These Terms & Conditions are governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000 and its amendments. Any disputes arising from these terms or your use of DaanGuru shall be subject to the exclusive jurisdiction of the courts in Siliguri, West Bengal, India.",
    },
    {
        icon: Mail, num: '12', title: 'Contact for Legal Queries',
        body: "For any questions, concerns, or notices related to these Terms & Conditions, please contact us at legal@DaanGuru.in. We aim to respond to all legal correspondence within 7 business days.",
    },
];

export default function Terms() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    return (
        <div className="mx-auto max-w-3xl px-4 lg:px-6 pt-6 pb-28 lg:pb-12">

            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6">
                ← Back to Home
            </Link>

            {/* Header */}
            <div className={`glass-card p-6 lg:p-8 mb-6 relative overflow-hidden ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,153,51,0.1)' }}>
                        <FileText className="h-5 w-5" style={{ color: '#FF9933' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground">Terms & Conditions</h1>
                        <p className="text-xs text-muted-foreground">Last updated: April 15, 2025</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    By using DaanGuru, you agree to these terms. Please read them carefully. If you do not agree with any part of these terms, please do not use the platform.
                </p>
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {sections.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className={`glass-card p-5 lg:p-6 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: `${80 + i * 50}ms` }}>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(255,153,51,0.1)', color: '#FF9933' }}>{s.num}</span>
                                <Icon className="h-4 w-4" style={{ color: '#FF9933' }} />
                                <h2 className="text-base font-extrabold text-foreground">{s.title}</h2>
                            </div>
                            {s.intro && <p className="text-sm text-muted-foreground mb-2">{s.intro}</p>}
                            {s.content && (
                                <ul className="space-y-2">
                                    {s.content.map((item, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#FF9933' }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {s.body && <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-muted-foreground">Legal queries? Email <a href="mailto:legal@DaanGuru.in" className="font-semibold hover:underline" style={{ color: '#FF9933' }}>legal@DaanGuru.in</a></p>
            </div>
        </div>
    );
}
