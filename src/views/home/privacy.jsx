import { useEffect, useState } from 'react';
import { Shield, Eye, Lock, Trash2, Mail, Baby, RefreshCw, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';


const sections = [
    {
        icon: Eye,
        num: '01',
        title: 'Information We Collect',
        content: [
            'Name and contact details when you register',
            'WhatsApp number — only if you choose to share it publicly on a listing',
            'Items you post or claim on the platform',
            'Device and browser information for analytics (anonymous)',
            'Location data (city / pincode) you voluntarily provide',
            'Photos you upload of items you wish to donate',
        ],
    },
    {
        icon: Shield,
        num: '02',
        title: 'How We Use Your Information',
        content: [
            'To show your posted items to nearby users',
            'To allow interested users to contact you via WhatsApp',
            'To improve the platform and fix technical issues',
            'To send important platform updates (only if you opt in)',
            'We do NOT sell your data to anyone, ever.',
            'We do NOT use your data for targeted advertising.',
        ],
    },
    {
        icon: Lock,
        num: '03',
        title: 'What We Don\'t Do',
        content: [
            'We never sell your personal data to third parties',
            'We never share your WhatsApp number without your explicit consent',
            'We never run ads targeting you based on your personal data',
            'We never store payment information (UPI payments are direct)',
            'We never track your location without permission',
        ],
    },
    {
        icon: Lock,
        num: '04',
        title: 'Data Storage & Security',
        body: 'Your data is stored securely using Supabase (PostgreSQL) with industry-standard AES-256 encryption. Images are stored on Cloudinary\'s secure servers. All data transmission is encrypted using HTTPS/TLS. We conduct regular security audits and follow best practices for data protection.',
    },
    {
        icon: RefreshCw,
        num: '05',
        title: 'Cookies',
        body: 'We use minimal, essential cookies only for keeping you logged in and remembering your preferences (such as dismissed banners). We do not use tracking cookies, advertising cookies, or any third-party analytics cookies that identify you personally.',
    },
    {
        icon: Shield,
        num: '06',
        title: 'Your Rights',
        content: [
            'Right to access — request a copy of your data',
            'Right to correction — update inaccurate information',
            'Right to deletion — request removal of your account and all data',
            'Right to opt out — unsubscribe from any communications at any time',
            'Right to portability — receive your data in a readable format',
        ],
        footer: 'To exercise any of these rights, contact us at privacy@daanguru.in',
    },
    {
        icon: Baby,
        num: '07',
        title: 'Children\'s Privacy',
        body: 'DaanGuru is not intended for users under 13 years of age. We do not knowingly collect personal information from children. If you believe a child has provided us with personal data, please contact us immediately at privacy@DaanGuru.in and we will delete it promptly.',
    },
    {
        icon: RefreshCw,
        num: '08',
        title: 'Changes to This Policy',
        body: 'We may update this Privacy Policy occasionally to reflect changes in our practices or legal requirements. We will notify you of significant changes via a banner in the app at least 7 days before the change takes effect. Continued use of DaanGuru after changes means you accept the updated policy.',
    },
    {
        icon: Mail,
        num: '09',
        title: 'Contact Us',
        body: 'For any privacy concerns, data requests, or questions about this policy, please reach out to us at privacy@DaanGuru.in. We aim to respond within 72 hours.',
    },
];

export default function Privacy() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => { setMounted(true); }, []);

    return (
        <>
            <Helmet>
                <title>Privacy Policy - DaanGuru | Your Data, Our Responsibility</title>
                <meta name="description" content="Read DaanGuru's privacy policy. Learn how we collect, use, and protect your personal information when using our free donation platform." />
                <meta name="keywords" content="privacy policy, data protection, user privacy, security, daanguru" />
                <meta property="og:title" content="Privacy Policy - DaanGuru" />
                <meta property="og:description" content="Learn how DaanGuru protects your privacy and data. Complete transparency in how we handle your information." />
                <meta property="og:image" content="https://www.daanguru.in/images/logo.png" />
                <meta property="og:url" content="https://www.daanguru.in/privacy" />
                <meta property="og:type" content="website" />
                <link rel="canonical" href="https://www.daanguru.in/privacy" />
            </Helmet>
            <div className="mx-auto max-w-3xl px-4 lg:px-6 pt-6 pb-28 lg:pb-12">

            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6">
                ← Back to Home
            </Link>

            {/* Header */}
            <div className={`glass-card p-6 lg:p-8 mb-6 relative overflow-hidden ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(33, 234, 15, 0.1)' }}>
                        <Shield className="h-5 w-5" style={{ color: '#ef9f27' }} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-extrabold text-foreground">Privacy Policy</h1>
                        <p className="text-xs text-muted-foreground">Last updated: April 15, 2025</p>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                    DaanGuru ("we", "our", "us") is committed to protecting your privacy. This policy explains how we collect, use, and protect your information when you use our platform. We believe privacy is a right, not a privilege.
                </p>
            </div>

            {/* Sections */}
            <div className="space-y-4">
                {sections.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} className={`glass-card p-5 lg:p-6 ${mounted ? 'animate-fade-up' : 'opacity-0'}`} style={{ animationDelay: `${100 + i * 60}ms` }}>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ background: 'rgba(19,136,8,0.1)', color: '#ef9f27' }}>{s.num}</span>
                                <Icon className="h-4 w-4" style={{ color: '#ef9f27' }} />
                                <h2 className="text-base font-extrabold text-foreground">{s.title}</h2>
                            </div>
                            {s.content && (
                                <ul className="space-y-2">
                                    {s.content.map((item, j) => (
                                        <li key={j} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: '#ef9f27' }} />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {s.body && <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>}
                            {s.footer && (
                                <p className="mt-3 text-xs font-semibold rounded-xl px-3 py-2" style={{ background: 'rgba(19,136,8,0.08)', color: '#ef9f27' }}>
                                    {s.footer}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-muted-foreground">Questions? Email us at <a href="mailto:privacy@DaanGuru.in" className="font-semibold hover:underline" style={{ color: '#ef9f27' }}>privacy@DaanGuru.in</a></p>
            </div>
        </div>
        </>
    );
}
