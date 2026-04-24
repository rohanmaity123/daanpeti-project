import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import { Helmet } from 'react-helmet';
import { Award, CheckCircle, Download, Printer, AlertCircle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';
import { CertificatePreview } from './CertificateGenerate';

export default function CertificateVerify() {
    const { certId } = useParams();
    const [cert, setCert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        if (certId) fetchCert();
    }, [certId]);

    const fetchCert = async () => {
        const { data, error } = await supabase
            .from('certificates')
            .select('*')
            .eq('cert_id', certId)
            .single();

        setLoading(false);
        if (error || !data) { setNotFound(true); return; }
        setCert(data);
    };

    const handleDownloadPDF = async () => {
        const el = document.getElementById('cert-preview');
        if (!el) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
            const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
            pdf.save(`Daanguru-Certificate-${certId}.pdf`);
            toast.success('PDF downloaded! 📄');
        } catch { toast.error('Download failed.'); }
        finally { setDownloading(false); }
    };

    const handleDownloadPNG = async () => {
        const el = document.getElementById('cert-preview');
        if (!el) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#fff' });
            const link = document.createElement('a');
            link.download = `Daanguru-Certificate-${certId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('Image downloaded! 🖼️');
        } catch { toast.error('Download failed.'); }
        finally { setDownloading(false); }
    };

    // Map DB row → CertificatePreview shape
    const previewData = cert ? {
        certType: cert.cert_type,
        recipientName: cert.recipient_name,
        date: cert.issued_date,
        issuerName: cert.issuer_name || 'Rohan Maity',
        issuerRole: cert.issuer_role || 'Founder, Daanguru',
        desc: cert.description || '',
        certId: cert.cert_id,
    } : null;

    return (
        <>
            <Helmet>
                <title>{cert ? `${cert.recipient_name}'s Certificate – Daanguru` : 'Verify Certificate – Daanguru'}</title>
                <meta name="description" content={cert ? `Official Daanguru certificate for ${cert.recipient_name}` : 'Verify a Daanguru certificate'} />
            </Helmet>

            <div className="mx-auto max-w-3xl px-4 lg:px-6 pt-6 pb-24 lg:pb-12">
                <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6">
                    ← Daanguru Home
                </Link>

                {/* Loading */}
                {loading && (
                    <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                        <div className="h-10 w-10 rounded-full border-4 border-[#138808] border-t-transparent animate-spin mb-4" />
                        <p className="text-sm font-bold text-muted-foreground">Verifying certificate…</p>
                    </div>
                )}

                {/* Not found */}
                {!loading && notFound && (
                    <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
                        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
                        <h1 className="text-xl font-extrabold text-foreground mb-2">Certificate Not Found</h1>
                        <p className="text-sm text-muted-foreground mb-6">
                            No certificate with ID <strong className="font-mono">{certId}</strong> exists in our records.
                        </p>
                        <Link to="/" className="rounded-xl px-6 py-2.5 text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                            Go to Daanguru Home
                        </Link>
                    </div>
                )}

                {/* Found */}
                {!loading && cert && previewData && (
                    <div className="space-y-4 animate-fade-up">

                        {/* Verified banner */}
                        <div className="flex items-center gap-3 rounded-2xl px-5 py-3.5" style={{ background: 'rgba(19,136,8,0.08)', border: '1px solid rgba(19,136,8,0.2)' }}>
                            <CheckCircle className="h-5 w-5 shrink-0" style={{ color: '#138808' }} />
                            <div>
                                <p className="text-sm font-extrabold" style={{ color: '#138808' }}>✅ Certificate Verified</p>
                                <p className="text-xs text-muted-foreground">This is an authentic certificate issued by Daanguru Organization.</p>
                            </div>
                        </div>

                        {/* Certificate */}
                        <div className="glass-card overflow-hidden">
                            <CertificatePreview data={previewData} />
                        </div>

                        {/* Download */}
                        <div className="glass-card p-4">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">Download Your Certificate</p>
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

                        {/* Meta */}
                        <div className="glass-card p-4 grid grid-cols-2 gap-3 text-xs">
                            {[
                                ['Certificate ID', cert.cert_id],
                                ['Recipient', cert.recipient_name],
                                ['Type', cert.cert_type?.charAt(0).toUpperCase() + cert.cert_type?.slice(1)],
                                ['Issued On', new Date(cert.issued_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })],
                                ['Issued By', cert.issuer_name || 'Rohan Maity'],
                                ['Verified By', 'Daanguru Organization'],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <span className="text-muted-foreground">{k}: </span>
                                    <span className="font-bold text-foreground">{v || '—'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
