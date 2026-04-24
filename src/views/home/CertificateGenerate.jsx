import { useEffect, useState, useRef } from 'react';
import { Award, Download, Printer, Search, CheckCircle, Link as LinkIcon, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { Helmet } from 'react-helmet';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ── Config ────────────────────────────────────────────────────────────────────
const typeConfig = {
    participation: { label: 'Certificate of Participation', heading: 'CERTIFICATE OF PARTICIPATION', desc: 'successfully participated in the Daanguru community platform', extra: 'We appreciate their contribution to building a generous and caring community.', emoji: '🤝', color: '#138808', bg: 'rgba(19,136,8,0.1)' },
    appreciation: { label: 'Certificate of Appreciation', heading: 'CERTIFICATE OF APPRECIATION', desc: 'demonstrated outstanding contribution to the Daanguru community', extra: 'Their generosity and commitment inspire others to give and share.', emoji: '🏆', color: '#FF9933', bg: 'rgba(255,153,51,0.1)' },
    completion: { label: 'Certificate of Completion', heading: 'CERTIFICATE OF COMPLETION', desc: 'successfully completed the Daanguru onboarding and community program', extra: 'This recognizes their dedication to responsible giving and receiving.', emoji: '🎓', color: '#0066CC', bg: 'rgba(0,102,204,0.1)' },
    donation: { label: 'Certificate of Donation', heading: 'CERTIFICATE OF DONATION', desc: 'generously donated items through the Daanguru platform, helping families in need', extra: 'Their act of kindness creates real impact in local communities.', emoji: '💝', color: '#E24B4A', bg: 'rgba(226,75,74,0.1)' },
    volunteer: { label: 'Certificate of Volunteering', heading: 'CERTIFICATE OF VOLUNTEERING', desc: 'volunteered their time and effort in support of the Daanguru mission', extra: 'Their selfless service strengthens the spirit of community giving.', emoji: '🌟', color: '#9333ea', bg: 'rgba(147,51,234,0.1)' },
    partnership: { label: 'Certificate of Partnership', heading: 'CERTIFICATE OF PARTNERSHIP', desc: 'entered into an official partnership with Daanguru', extra: 'Together, we build a more generous and connected community.', emoji: '🤲', color: '#25D366', bg: 'rgba(37,211,102,0.1)' },
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const formatDate = (val) => { if (!val) return '—'; const d = new Date(val); return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const generateCertId = () => 'DG-' + Date.now().toString(36).toUpperCase().slice(-6);

// ── Signature SVG (Rohan Maity cursive style) ────────────────────────────────
function SignatureSVG({ color = '#1a1a1a' }) {
    return (
        <svg viewBox="0 0 160 48" width="160" height="48" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
            <path
                d="M8,36 C12,20 18,14 26,18 C30,20 28,28 24,30 C20,32 18,28 22,24 C28,18 36,16 44,20 C50,24 48,34 44,36
                   M44,36 C48,26 54,20 62,22 C66,24 64,32 60,34
                   M60,34 C64,28 70,24 76,26 C80,28 79,34 76,36 C73,38 71,34 74,30 C78,24 86,22 92,26
                   M92,26 C96,18 102,16 108,20 C112,24 108,32 104,34 C100,36 98,30 102,26 C108,20 116,20 122,26 C126,30 124,36 120,38
                   M120,38 C124,30 130,26 136,28 C140,30 140,36 136,38 C134,39 132,36 134,32 C138,26 144,26 150,30"
                stroke={color}
                strokeWidth="1.8"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

// ── Certificate Preview ───────────────────────────────────────────────────────
export function CertificatePreview({ data }) {
    const cfg = typeConfig[data.certType] || typeConfig.participation;

    return (
        <div
            id="cert-preview"
            style={{
                position: 'relative',
                background: '#fff',
                fontFamily: 'Georgia, "Times New Roman", serif',
                padding: '40px 48px',
                minHeight: 420,
                boxSizing: 'border-box',
                overflow: 'hidden',
            }}
        >
            {/* Outer green border */}
            <div style={{
                position: 'absolute',
                inset: 10,
                border: '3px solid #138808',
                borderRadius: 6,
                pointerEvents: 'none',
                zIndex: 1,
            }} />

            {/* Inner saffron border (offset) */}
            <div style={{
                position: 'absolute',
                inset: 16,
                border: '1px solid #FF9933',
                borderRadius: 4,
                pointerEvents: 'none',
                zIndex: 1,
            }} />

            {/* Corner ornaments */}
            {[
                { top: 6, left: 6, borderTop: '4px solid #FF9933', borderLeft: '4px solid #FF9933', borderRadius: '6px 0 0 0' },
                { top: 6, right: 6, borderTop: '4px solid #FF9933', borderRight: '4px solid #FF9933', borderRadius: '0 6px 0 0' },
                { bottom: 6, left: 6, borderBottom: '4px solid #FF9933', borderLeft: '4px solid #FF9933', borderRadius: '0 0 0 6px' },
                { bottom: 6, right: 6, borderBottom: '4px solid #FF9933', borderRight: '4px solid #FF9933', borderRadius: '0 0 6px 0' },
            ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 32, height: 32, pointerEvents: 'none', zIndex: 2, ...s }} />
            ))}

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 3 }}>

                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: 8 }}>
                    <img src="/logo.png" alt="Daanguru" style={{ height: 52, objectFit: 'contain' }}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                </div>

                {/* Tricolor bar */}
                <div style={{
                    height: 4,
                    background: 'linear-gradient(90deg, #FF9933 33.3%, #ffffff 33.3%, #ffffff 66.6%, #138808 66.6%)',
                    margin: '8px 32px 14px',
                    borderRadius: 2,
                    border: '0.5px solid #e0e0e0',
                }} />

                {/* Sub label */}
                <div style={{ textAlign: 'center', fontSize: 9, letterSpacing: 5, textTransform: 'uppercase', color: '#999', marginBottom: 4 }}>
                    {cfg.label}
                </div>

                {/* Main heading */}
                <div style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, color: '#138808', letterSpacing: 2, marginBottom: 18 }}>
                    {cfg.heading}
                </div>

                {/* Body */}
                <div style={{ textAlign: 'center', fontSize: 13, color: '#444', lineHeight: 1.9 }}>
                    <p style={{ margin: 0 }}>This is to certify that</p>
                    <div style={{
                        fontSize: 26,
                        fontWeight: 700,
                        color: '#111',
                        borderBottom: '2px solid #138808',
                        display: 'inline-block',
                        padding: '0 20px 5px',
                        margin: '8px 0 10px',
                        fontStyle: 'italic',
                    }}>
                        {data.recipientName || 'Recipient Name'}
                    </div>
                    <p style={{ margin: 0 }}>has {data.desc || cfg.desc}.</p>
                </div>

                {/* Extra note */}
                <p style={{ fontSize: 11, color: '#999', margin: '10px 32px 0', lineHeight: 1.7, textAlign: 'center', fontStyle: 'italic' }}>
                    {cfg.extra}
                </p>

                {/* Footer: Signature | Seal | Verified */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28, padding: '0 16px' }}>

                    {/* Left: Rohan Maity signature */}
                    <div style={{ textAlign: 'center', minWidth: 130 }}>
                        <SignatureSVG color="#1a1a1a" />
                        <div style={{ width: 130, borderTop: '1.5px solid #333', margin: '4px auto 5px' }} />
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>Rohan Maity</div>
                        <div style={{ fontSize: 10, color: '#888' }}>Founder, Daanguru</div>
                    </div>

                    {/* Center: Official Seal */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <div style={{
                            width: 72, height: 72,
                            borderRadius: '50%',
                            border: '2px solid #138808',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: 'rgba(19,136,8,0.05)',
                        }}>
                            <img src="/logo.png" alt="Seal" style={{ width: 52, height: 52, objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(19,136,8,0.3))' }}
                                onError={(e) => { e.target.style.display = 'none'; }} />
                        </div>
                        <span style={{ fontSize: 7, fontWeight: 700, color: '#138808', letterSpacing: 2, textTransform: 'uppercase' }}>Official Seal</span>
                    </div>

                    {/* Right: Verified by Daanguru Organization */}
                    <div style={{ textAlign: 'center', minWidth: 130 }}>
                        {/* Checkmark stamp look */}
                        <div style={{
                            fontSize: 22,
                            marginBottom: 2,
                            filter: 'drop-shadow(0 1px 2px rgba(19,136,8,0.4))',
                        }}>✅</div>
                        <div style={{ width: 130, borderTop: '1.5px solid #333', margin: '4px auto 5px' }} />
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#111' }}>Verified by</div>
                        <div style={{ fontSize: 10, color: '#888' }}>Daanguru Organization</div>
                    </div>
                </div>

                {/* Cert meta */}
                <div style={{ fontSize: 10, color: '#bbb', textAlign: 'center', marginTop: 18 }}>
                    Date: {formatDate(data.date)} &nbsp;|&nbsp; Certificate ID: <strong style={{ color: '#999' }}>{data.certId}</strong>
                </div>

                {/* Verify URL */}
                <div style={{ fontSize: 9, color: '#ccc', textAlign: 'center', marginTop: 4, letterSpacing: 0.5 }}>
                    Verify at: www.daanguru.in/certificate/verify/{data.certId}
                </div>
            </div>
        </div>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CertificateGenerator() {
    const [mounted, setMounted] = useState(false);
    const [certType, setCertType] = useState('participation');
    const [userInfo, setUserInfo] = useState(null);
    const [loadingUser, setLoadingUser] = useState(false);
    const [searchName, setSearchName] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [generated, setGenerated] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const previewRef = useRef(null);

    useEffect(() => { setMounted(true); }, []);

    const { register, handleSubmit, formState: { errors }, setValue } = useForm();

    const fetchUser = async () => {
        if (!searchName?.trim()) return toast.error('Please enter a name');
        setLoadingUser(true);
        setUserInfo(null);
        setSearchResults([]);
        const { data, error } = await supabase.rpc('search_users_by_name', { search_query: searchName.trim() });
        setLoadingUser(false);
        if (error) return toast.error('Search failed: ' + error.message);
        if (!data?.length) return toast.error('No user found with that name.');
        if (data.length === 1) { selectUser(data[0]); } else { setSearchResults(data); }
    };

    const selectUser = (user) => {
        setUserInfo(user);
        setSearchResults([]);
        setValue('recipientName', user.full_name || user.email?.split('@')[0] || '');
        toast.success(`Selected: ${user.full_name || user.email} ✅`);
    };

    const onGenerate = async (formData) => {
        if (!userInfo) return toast.error('Pehle user dhundho!');
        const certId = generateCertId();
        const certData = {
            certType,
            recipientName: formData.recipientName.trim(),
            date: formData.date,
            issuerName: 'Rohan Maity',
            issuerRole: 'Founder, Daanguru',
            desc: formData.desc?.trim() || '',
            certId,
            userId: userInfo.id,
        };

        const { error } = await supabase.from('certificates').insert({
            cert_id: certId,
            user_id: userInfo.id,
            recipient_name: certData.recipientName,
            cert_type: certType,
            issued_date: formData.date || new Date().toISOString().split('T')[0],
            issuer_name: certData.issuerName,
            issuer_role: certData.issuerRole,
            description: certData.desc,
        });

        if (error) return toast.error('Save failed: ' + error.message);

        const link = `${window.location.origin}/certificate/verify/${certId}`;
        setGenerated(certData);
        setShareLink(link);
        toast.success('Certificate ban gaya! 🎉');
        setTimeout(() => previewRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };

    const copyLink = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success('Link copied! 🔗');
    };

    const handleDownloadPDF = async () => {
        const el = document.getElementById('cert-preview');
        if (!el) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`Daanguru-Certificate-${generated.certId}.pdf`);
            toast.success('PDF downloaded! 📄');
        } catch { toast.error('Download failed. Try Print.'); }
        finally { setDownloading(false); }
    };

    const handleDownloadPNG = async () => {
        const el = document.getElementById('cert-preview');
        if (!el) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
            const link = document.createElement('a');
            link.download = `Daanguru-Certificate-${generated.certId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('Image downloaded! 🖼️');
        } catch { toast.error('Download failed.'); }
        finally { setDownloading(false); }
    };

    return (
        <>
            <Helmet>
                <title>Generate Certificate - DaanGuru</title>
                <meta name="description" content="Generate official Daanguru certificates for donors, volunteers, and partners." />
                <link rel="canonical" href="https://www.daanguru.in/certificate" />
            </Helmet>

            <div className="mx-auto max-w-5xl px-4 lg:px-6 pt-6 pb-28 lg:pb-12">
                <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6">
                    ← Back to Home
                </Link>

                {/* Header */}
                <div className={`glass-card p-6 lg:p-8 mb-6 relative overflow-hidden ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(19,136,8,0.1)' }}>
                            <Award className="h-5 w-5" style={{ color: '#138808' }} />
                        </div>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground">Praman Patra Banayein 🏅</h1>
                            <p className="mt-0.5 text-sm text-muted-foreground">Generate official Daanguru certificates by User ID</p>
                        </div>
                    </div>
                </div>

                <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">

                    {/* ── Left: 3-step form ── */}
                    <div className="space-y-4">

                        {/* Step 1 */}
                        <div className={`glass-card p-6 ${mounted ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
                            <h2 className="text-base font-extrabold text-foreground mb-1">Step 1 — User Dhundho 🔍</h2>
                            <p className="text-xs text-muted-foreground mb-4">Search by name — select the correct user from results.</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type user's name e.g. Rahul Sharma..."
                                    value={searchName}
                                    onChange={(e) => setSearchName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchUser()}
                                    className="flex-1 rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                                />
                                <button
                                    type="button"
                                    onClick={fetchUser}
                                    disabled={loadingUser}
                                    className="flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}
                                >
                                    <Search className="h-4 w-4" />
                                    {loadingUser ? 'Searching...' : 'Find'}
                                </button>
                            </div>

                            {searchResults.length > 1 && (
                                <div className="mt-2 rounded-xl border border-input overflow-hidden" style={{ background: 'var(--color-background-primary,#fff)' }}>
                                    <p className="text-xs font-bold text-muted-foreground px-3 py-2 border-b border-input">
                                        {searchResults.length} users found — select one:
                                    </p>
                                    {searchResults.map((u) => (
                                        <button key={u.id} type="button" onClick={() => selectUser(u)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-muted transition-colors border-b border-input last:border-0">
                                            {u.avatar_url
                                                ? <img src={u.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover shrink-0" />
                                                : <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ background: '#138808' }}>{u.full_name?.[0]?.toUpperCase() || '?'}</div>
                                            }
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate">{u.full_name || '—'}</p>
                                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                            </div>
                                            <span className="ml-auto text-xs text-muted-foreground shrink-0">Select →</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {userInfo && (
                                <div className="mt-4 rounded-xl p-4 animate-scale-in" style={{ background: 'rgba(19,136,8,0.07)', border: '1px solid rgba(19,136,8,0.2)' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="h-4 w-4" style={{ color: '#138808' }} />
                                        <span className="text-xs font-bold" style={{ color: '#138808' }}>User Found!</span>
                                    </div>
                                    <div className="flex items-center gap-3 mb-3">
                                        {userInfo.avatar_url
                                            ? <img src={userInfo.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover shrink-0" />
                                            : <div className="h-10 w-10 rounded-full shrink-0 flex items-center justify-center text-sm font-bold text-white" style={{ background: '#138808' }}>{userInfo.full_name?.[0]?.toUpperCase() || '?'}</div>
                                        }
                                        <div>
                                            <p className="text-sm font-extrabold text-foreground">{userInfo.full_name || '—'}</p>
                                            <p className="text-xs text-muted-foreground">{userInfo.email}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Step 2 */}
                        <div className={`glass-card p-6 ${mounted ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
                            <h2 className="text-base font-extrabold text-foreground mb-1">Step 2 — Prakar Chunein 📋</h2>
                            <p className="text-xs text-muted-foreground mb-4">Select the certificate type.</p>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.entries(typeConfig).map(([key, cfg]) => (
                                    <button key={key} type="button" onClick={() => setCertType(key)}
                                        className="rounded-xl p-3 text-center text-xs font-semibold transition-all active:scale-95"
                                        style={{
                                            background: certType === key ? cfg.bg : undefined,
                                            border: certType === key ? `2px solid ${cfg.color}` : '0.5px solid #e0dfd8',
                                            color: certType === key ? cfg.color : undefined,
                                        }}>
                                        <span className="text-lg block mb-1">{cfg.emoji}</span>
                                        {cfg.label.replace('Certificate of ', '')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 3 */}
                        <div className={`glass-card p-6 ${mounted ? 'animate-fade-up delay-300' : 'opacity-0'}`}>
                            <h2 className="text-base font-extrabold text-foreground mb-1">Step 3 — Vivaran Bharein ✍️</h2>
                            <p className="text-xs text-muted-foreground mb-4">Fill in certificate details.</p>
                            <form onSubmit={handleSubmit(onGenerate)} className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { label: 'Recipient Name', name: 'recipientName', placeholder: 'e.g. Rahul Sharma', required: true, type: 'text' },
                                        { label: 'Date', name: 'date', placeholder: '', required: true, type: 'date' },
                                    ].map((f) => (
                                        <div key={f.name}>
                                            <label className="text-xs font-bold text-foreground block mb-1.5">{f.label}</label>
                                            <input type={f.type} placeholder={f.placeholder}
                                                {...register(f.name, { required: f.required })}
                                                className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring" />
                                            {errors[f.name] && <p className="text-red-500 text-xs mt-1">Required</p>}
                                        </div>
                                    ))}
                                </div>

                                {/* Issuer locked fields (shown read-only) */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-bold text-foreground block mb-1.5">Issued By</label>
                                        <input type="text" value="Rohan Maity" readOnly
                                            className="w-full rounded-xl border border-input bg-muted px-3.5 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-foreground block mb-1.5">Verified By</label>
                                        <input type="text" value="Daanguru Organization" readOnly
                                            className="w-full rounded-xl border border-input bg-muted px-3.5 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed" />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-foreground block mb-1.5">
                                        Achievement <span className="font-normal text-muted-foreground">(optional)</span>
                                    </label>
                                    <textarea rows={3} placeholder={typeConfig[certType].desc}
                                        {...register('desc')}
                                        className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring resize-none" />
                                </div>

                                <button type="submit" disabled={!userInfo}
                                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                                    style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                                    <Award className="h-4 w-4" />
                                    Praman Patra Banao! Generate 🏅
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* ── Right: Preview ── */}
                    <div ref={previewRef} className={mounted ? 'animate-fade-up delay-200' : 'opacity-0'}>
                        <h2 className="text-lg font-extrabold text-foreground mb-4">Preview 👁️</h2>

                        {!generated ? (
                            <div className="glass-card p-10 flex flex-col items-center justify-center text-center min-h-64">
                                <Award className="h-12 w-12 mb-3 text-muted-foreground opacity-20" />
                                <p className="text-sm font-bold text-muted-foreground">Certificate preview will appear here</p>
                                <p className="text-xs text-muted-foreground mt-1">Complete the form and click Generate</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <div className="glass-card overflow-hidden">
                                    <CertificatePreview data={generated} />
                                </div>

                                {/* Shareable Link */}
                                {shareLink && (
                                    <div className="glass-card p-4">
                                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">🔗 Shareable Certificate Link</p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 rounded-xl border border-input bg-muted px-3 py-2 text-xs text-muted-foreground truncate font-mono">
                                                {shareLink}
                                            </div>
                                            <button
                                                onClick={copyLink}
                                                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-white hover:opacity-90 active:scale-95 transition-all shrink-0"
                                                style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}
                                            >
                                                <Copy className="h-3.5 w-3.5" /> Copy
                                            </button>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            Share this link with the recipient to let them view & verify their certificate.
                                        </p>
                                    </div>
                                )}

                                {/* Download / Print */}
                                <div className="glass-card p-4">
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Download / Share</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={handleDownloadPDF} disabled={downloading}
                                            className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-bold text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                                            style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                                            <Download className="h-4 w-4" /> PDF
                                        </button>
                                        <button onClick={handleDownloadPNG} disabled={downloading}
                                            className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-bold text-white hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                                            style={{ background: 'linear-gradient(135deg,#FF9933,#e07722)' }}>
                                            <Download className="h-4 w-4" /> PNG
                                        </button>
                                        <button onClick={() => window.print()}
                                            className="flex flex-col items-center gap-1.5 rounded-xl p-3 text-xs font-bold hover:opacity-90 active:scale-95 transition-all"
                                            style={{ background: 'rgba(19,136,8,0.08)', color: '#138808', border: '1px solid rgba(19,136,8,0.2)' }}>
                                            <Printer className="h-4 w-4" /> Print
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @media print {
                    body * { visibility: hidden; }
                    #cert-preview, #cert-preview * { visibility: visible; }
                    #cert-preview { position: fixed; top: 0; left: 0; width: 100%; }
                }
            `}</style>
        </>
    );
}
