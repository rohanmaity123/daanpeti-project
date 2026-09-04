import { useEffect, useMemo, useState, useRef } from 'react';
import { GraduationCap, Search, Eye, Pencil, Trash2, Download, Printer, X, ImageIcon, FileText } from 'lucide-react';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AuthGate from '../../guards/AuthGate/AuthGate';
import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import SignaturePad from '../../components/Signature/SignatureCapture';

// ── School config ─────────────────────────────────────────────────────────────
const SCHOOL = {
    name: 'MARWARI +2 HINDI HIGH SCHOOL, GHATSILA',
    address: 'FULDUNGRI, GHATSILA, EAST SINGHBHUM, JHARKHAND - 832303',
    udise: '20180615005',
    logoUrl: '/logo-school.png', // save the school-seal image you shared as public/logo.png — this is what renders in the certificate
    signatoryName: 'Amita Kumari',
    signatoryRole: 'Incharge Headmaster',
};

const CLASS_OPTIONS = ['IX', 'X', 'XI', 'XII'];
const STREAM_OPTIONS = ['Science', 'Commerce', 'Arts'];
const CHARACTER_OPTIONS = ['Moral', 'Good', 'Excellent'];
const EXAM_TYPE_OPTIONS = ['Annual', 'Supplementary'];
const LEVEL_OPTIONS = ['Secondary', 'Intermediate'];
const PASSING_YEAR_OPTIONS = Array.from({ length: 2040 - 2026 + 1 }, (_, i) => 2026 + i);
const CERTIFICATE_TYPES = {
    slc: { label: 'School Leaving Certificate', short: 'SLC' },
    tc: { label: 'Transfer Certificate', short: 'TC' },
    character: { label: 'Character Certificate', short: 'CC' },
    bonafide: { label: 'Bonafide Certificate', short: 'BC' },
};
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const formatDate = (val) => {
    if (!val) return '—';
    const [y, m, d] = val.split('-').map(Number);
    if (!y || !m || !d) return '—';
    return `${String(d).padStart(2, '0')}-${String(m).padStart(2, '0')}-${y}`;
};
const titleCase = (s = '') => s.trim().replace(/\s+/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
const slug = (s = '') => s.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
const genRegNo = () => 'SLC-' + Date.now().toString(36).toUpperCase().slice(-7);

// Bold, coloured inline value — this is how every piece of student input stands out in the body text.
const Val = ({ children }) => (
    <strong style={{ color: '#a1660f', fontWeight: 700 }}>{children}</strong>
);

// ── Decorative corner flourish (gold scrollwork, like the reference certificate) ──
function CornerFlourish({ flipX, flipY }) {
    const transform = `${flipX ? 'scaleX(-1)' : ''} ${flipY ? 'scaleY(-1)' : ''}`.trim();
    return (
        <svg width="30mm" height="30mm" viewBox="0 0 100 100" style={{ transform }} xmlns="http://www.w3.org/2000/svg">
            <g fill="none" stroke="#c9a227" strokeWidth="1.5" strokeLinecap="round">
                <path d="M3,3 C3,34 11,52 34,56 C11,60 3,78 3,97" />
                <path d="M3,3 C34,3 52,11 56,34 C60,11 78,3 97,3" />
                <path d="M14,14 C14,32 24,40 38,42" />
                <path d="M14,14 C32,14 40,24 42,38" />
                <path d="M46,10 C58,10 65,17 65,27" />
                <path d="M10,46 C10,58 17,65 27,65" />
                <circle cx="38" cy="42" r="2.4" fill="#c9a227" stroke="none" />
                <circle cx="42" cy="38" r="2.4" fill="#c9a227" stroke="none" />
                <circle cx="65" cy="27" r="1.6" fill="#c9a227" stroke="none" />
                <circle cx="27" cy="65" r="1.6" fill="#c9a227" stroke="none" />
            </g>
        </svg>
    );
}
function CertificatePage({ children, captureId = 'slc-preview', school }) {
    return (
        <div id={captureId} style={{
            width: '297mm', minHeight: '210mm', margin: '0 auto', background: '#fdfcf9',
            fontFamily: 'Georgia, "Times New Roman", serif', boxSizing: 'border-box',
            position: 'relative', padding: '12mm 20mm', color: '#2a2a2a',
        }}>
            <div style={{ position: 'absolute', top: '5mm', left: '5mm' }}><CornerFlourish /></div>
            <div style={{ position: 'absolute', top: '5mm', right: '5mm' }}><CornerFlourish flipX /></div>
            <div style={{ position: 'absolute', bottom: '5mm', left: '5mm' }}><CornerFlourish flipY /></div>
            <div style={{ position: 'absolute', bottom: '5mm', right: '5mm' }}><CornerFlourish flipX flipY /></div>
            <div style={{ position: 'relative' }}>
                <OrnamentDivider />
                <div style={{ textAlign: 'center', marginTop: '5mm' }}>
                    <div style={{ fontWeight: 800, fontSize: 22, color: '#132848', letterSpacing: 0.3, lineHeight: 1.25 }}>
                        {school?.school_name}
                    </div>
                </div>
                <div style={{ textAlign: 'center', margin: '4mm 0' }}>
                    <img src={school?.logo} alt="School Logo" style={{ height: 64, width: 64, objectFit: 'contain', display: 'inline-block' }}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                {children}
                <div style={{ marginTop: '5mm' }}><OrnamentDivider /></div>
            </div>
        </div>
    );
}

function SignatureBlock({ school, data }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8mm', padding: '0 6mm' }}>
            <div style={{ textAlign: 'center', minWidth: '58mm' }}>
                {(data?.signature && school?.signature_url) ? (
                    <img
                        src={school.signature_url}
                        alt="Signature"
                        style={{ height: 40, objectFit: 'contain', display: 'block', margin: '0 auto 2mm' }}
                        crossOrigin="anonymous"
                    />
                ) : (
                    <div style={{ borderTop: '1.4px solid #333', width: '50mm', margin: '2mm auto' }} />
                )}
                <div style={{ fontSize: 11.5, fontStyle: 'italic', color: '#1c3fa0', fontWeight: 600 }}>{SCHOOL.signatoryRole}</div>
                <div style={{ fontSize: 11.5, color: '#1c3fa0', fontWeight: 700, marginTop: '0.5mm' }}>{school?.school_name}</div>
            </div>
        </div>
    );
}

function CertTitle({ children }) {
    return (
        <div style={{
            fontWeight: 800, fontSize: 25, color: '#1c3fa0', letterSpacing: 0.5, textAlign: 'center',
            textDecoration: 'underline', textUnderlineOffset: '4px', marginTop: '2.5mm'
        }}>
            {children}
        </div>
    );
}
// ── Small ornamental divider (line – diamonds – line), matches the reference top/bottom rule ──
function OrnamentDivider() {
    const dot = { width: 4.5, height: 4.5, background: '#c9a227', transform: 'rotate(45deg)', display: 'inline-block' };
    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, width: '78%', margin: '0 auto' }}>
            <span style={{ flex: 1, height: 1, background: '#c9a227' }} />
            <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <span style={dot} /><span style={dot} /><span style={{ ...dot, width: 7, height: 7 }} /><span style={dot} /><span style={dot} />
            </span>
            <span style={{ flex: 1, height: 1, background: '#c9a227' }} />
        </div>
    );
}
function CharacterCertificateLayout({ data, school }) {
    return (
        <>
            <CertTitle>Character Certificate</CertTitle>
            <div style={{ fontSize: 13.5, lineHeight: 1.85, textAlign: 'center', padding: '0 14mm', marginTop: '4mm' }}>
                This is to certify that <Val>{titleCase(data.student_name) || '________'}</Val>, child
                of Smt. <Val>{titleCase(data.mother_name) || '________'}</Val> (Mother) and
                Shri <Val>{titleCase(data.father_name) || '________'}</Val> (Father), was a bonafide
                student of this school, studying in Class{' '}
                <Val>{data.class || '—'}{data.stream ? ` (${data.stream})` : ''}</Val> during
                Session <Val>{data.session || '—'}</Val>. As per school records, their Date of Birth
                is <Val>{formatDate(data.date_of_birth)}</Val>.
                {data.subjects?.length ? <> They studied the following subjects: <Val>{data.subjects.join(', ')}</Val>.</> : null}
                {' '}They have passed the <Val>{data.level || 'Secondary'}</Val> <Val>{data.exam_type || 'Annual'}</Val> examination
                conducted by the {school?.council}, in the year <Val>{data.passing_year || '—'}</Val>.
                {' '}To the best of our knowledge, their character has been <Val>{data.character || 'Good'}</Val>.
                {data.address ? <> Address: <Val>{data.address}</Val>.</> : null}
                <br /><br />
                We wish them every success in their future endeavours.
            </div>
            <div style={{ fontSize: 11.5, color: '#666', marginTop: '5mm', padding: '0 6mm' }}>
                Date: <strong style={{ color: '#333' }}>{formatDate(data.issue_date)}</strong>
            </div>
            <SignatureBlock school={school} data={data} />
        </>
    );
}
function Row({ num, label, children }) {
    return (
        <div style={{ display: 'flex', gap: 6, fontSize: 13, lineHeight: 2.1, borderBottom: '1px dotted #999', paddingBottom: 1 }}>
            {num && <span style={{ fontWeight: 700, width: 16 }}>{num}.</span>}
            <span style={{ minWidth: 190, fontWeight: 700 }}>{label}</span>
            <span style={{ flex: 1 }}><Val>{children || '—'}</Val></span>
        </div>
    );
}

function SchoolLeavingCertificateLayout({ data, school }) {
    // const address = [data.village, data.po].filter(Boolean).join(', P.O.-');
    return (
        <>
            <CertTitle>School Leaving Certificate</CertTitle>
            <div style={{ padding: '4mm 10mm 0', display: 'flex', flexDirection: 'column', gap: '1mm' }}>
                <Row num={1} label="Pupil's Name">{titleCase(data.student_name)}</Row>
                <Row label={`Roll Code No. ${data.roll_code_no || '—'}   Roll No.`}>{data.roll_no}</Row>
                <Row num={2} label="Mother's Name">{titleCase(data.mother_name)}</Row>
                <Row num={3} label="Father's Name">{titleCase(data.father_name)}</Row>
                <Row num={4} label="Village">{data.village}</Row>
                <Row label="P.S. / District">{[data.ps, data.district].filter(Boolean).join(' / ')}</Row>
                <Row num={5} label="Date of Birth">{formatDate(data.date_of_birth)}</Row>
                <Row num={6} label={`Year of Passing ${school?.council}`}>{data.passing_year}</Row>
                <Row num={7} label="Result">{data.result}</Row>
                <Row num={8} label="Character">{data.character}</Row>
                <Row num={9} label="Subjects">{data.subjects?.join(', ')}</Row>
                <Row label="Additional Subjects">{data.additional_subjects}</Row>
                <Row label="Date of Issue">{formatDate(data.issue_date)}</Row>
            </div>
            <SignatureBlock school={school} data={data} />
        </>
    );
}
function BonafideCertificateLayout({ data, school }) {
    return (
        <>
            <div style={{ textAlign: 'center', fontSize: 11, marginTop: '3mm' }}>
                Ref. No.: <Val>{data.ref_no || '—'}</Val> &nbsp;&nbsp;&nbsp; Date: <Val>{formatDate(data.issue_date)}</Val>
            </div>
            <CertTitle>Bonafide Certificate</CertTitle>
            <div style={{ fontSize: 13.5, lineHeight: 2.1, padding: '5mm 14mm 0' }}>
                This is to certify that <Val>{titleCase(data.student_name) || '________'}</Val>,{' '}
                S/o / D/o <Val>{titleCase(data.father_name) || '________'}</Val>, Village: <Val>{data.village || '—'}</Val>,{' '}
                P.O.: <Val>{data.po || '—'}</Val>, P.S.: <Val>{data.ps || '—'}</Val>, District: <Val>{data.district || '—'}</Val>{' '}
                is a permanent resident of the above address. {data.gender || 'He'} / She is a former / regular
                student of Class <Val>{data.class || '—'}</Val> of our school. As per the school admission register,
                {data.gender === 'She' ? ' her' : ' his'} date of birth is <Val>{formatDate(data.date_of_birth)}</Val>.
                <br /><br />
                I wish {data.gender === 'She' ? 'her' : 'him'} a bright future.
            </div>
            <SignatureBlock school={school} data={data} />
        </>
    );
}
function TcRow({ label, children, wide }) {
    return (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 14, marginBottom: '5mm' }}>
            <span style={{ whiteSpace: 'nowrap' }}>{label}</span>
            <span style={{
                flex: wide ? 1 : 'none',
                minWidth: wide ? undefined : '55mm',
                borderBottom: '1px solid #333',
                paddingBottom: 1,
                textAlign: 'center',
            }}>
                <Val>{children || '\u00A0'}</Val>
            </span>
        </div>
    );
}

function TransferCertificateLayout({ data, school }) {
    return (
        <>
            <CertTitle>Transfer Certificate</CertTitle>
            <div style={{ padding: '8mm 14mm 0', fontSize: 14, lineHeight: 1.9 }}>
                <TcRow label="This is to certify that" wide>{titleCase(data.student_name)}</TcRow>
                <TcRow label="Student's Name" wide>{titleCase(data.student_name)}</TcRow>
                <TcRow label="son/daughter of" wide>{titleCase(data.father_name)}</TcRow>

                <div style={{ display: 'flex', gap: '10mm', flexWrap: 'wrap' }}>
                    <TcRow label="with Admission Number">{data.admission_number}</TcRow>
                    <TcRow label="studied in Class & Section">
                        {data.class || '—'}{data.section ? ` - ${data.section}` : ''}
                    </TcRow>
                </div>

                <div style={{ display: 'flex', gap: '10mm', flexWrap: 'wrap' }}>
                    <TcRow label="born on">{formatDate(data.date_of_birth)}</TcRow>
                    <TcRow label="and is leaving the school on">{formatDate(data.leaving_date)}</TcRow>
                </div>

                <TcRow label="Reason for Leaving" wide>{data.reason_for_leaving}</TcRow>

                <TcRow label="Date of Issue">{formatDate(data.issue_date)}</TcRow>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '10mm', padding: '0 14mm 0 6mm' }}>
                <div style={{
                    width: '26mm', height: '26mm', borderRadius: '50%', border: '1.5px solid #999',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textAlign: 'center', fontSize: 10, color: '#999', lineHeight: 1.3,
                }}>
                    School<br />Seal
                </div>
                <div style={{ textAlign: 'center', minWidth: '58mm' }}>
                    {school?.signature_url && data?.signature ? (
                        <img
                            src={school.signature_url}
                            alt="Signature"
                            style={{ height: 40, objectFit: 'contain', display: 'block', margin: '0 auto 2mm' }}
                            crossOrigin="anonymous"
                        />
                    ) : (
                        <div style={{ borderTop: '1.4px solid #333', width: '50mm', margin: '2mm auto' }} />
                    )}
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Signature</div>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Principal</div>
                </div>
            </div>
        </>
    );
}
const CERT_LAYOUTS = {
    slc: SchoolLeavingCertificateLayout,
    tc: TransferCertificateLayout,
    character: CharacterCertificateLayout,
    bonafide: BonafideCertificateLayout,
};

function CertificateDocument({ data, captureId, school }) {
    const Layout = CERT_LAYOUTS[data.certificate_type] || CharacterCertificateLayout;
    return (
        <CertificatePage captureId={captureId} school={school}>
            <Layout data={data} school={school} />
        </CertificatePage>
    );
}


// ── Main component ────────────────────────────────────────────────────────────
function SchoolLeavingCertificate({ session, school }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [search, setSearch] = useState('');
    const [classFilter, setClassFilter] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [certificateType, setCertificateType] = useState('character');
    const [typeFilter, setTypeFilter] = useState('');
    // Preview modal state — also used as the "render target" for PNG/PDF/print actions
    const [previewStudent, setPreviewStudent] = useState(null);
    const [pendingAction, setPendingAction] = useState(null); // 'png' | 'pdf' | 'print' | null
    const [busy, setBusy] = useState(false);
    const [wantsSignature, setWantsSignature] = useState(!!school.signature_url);

    // Responsive scaling for the preview modal — declared AFTER previewStudent so the effect below can reference it safely
    const [modalWidth, setModalWidth] = useState(0);
    const modalBodyRef = useRef(null);

    useEffect(() => {
        if (!previewStudent) return;
        const measure = () => {
            if (modalBodyRef.current) setModalWidth(modalBodyRef.current.offsetWidth);
        };
        measure();
        window.addEventListener('resize', measure);
        return () => window.removeEventListener('resize', measure);
    }, [previewStudent]);

    const CERT_WIDTH_MM = 297;
    const CERT_HEIGHT_MM = 210;
    const MM_TO_PX = 3.7795;
    const certWidthPx = CERT_WIDTH_MM * MM_TO_PX;
    const certHeightPx = CERT_HEIGHT_MM * MM_TO_PX;
    const scale = modalWidth > 0 ? Math.min((modalWidth - 32) / certWidthPx, 1) : 0.5;



    // Subjects are a tag-style input, kept outside react-hook-form for simplicity.
    const [subjects, setSubjects] = useState([]);
    const [subjectInput, setSubjectInput] = useState('');

    const addSubject = () => {
        const v = subjectInput.trim();
        if (!v) return;
        if (!subjects.some((s) => s.toLowerCase() === v.toLowerCase())) setSubjects((prev) => [...prev, v]);
        setSubjectInput('');
    };
    const removeSubject = (v) => setSubjects((prev) => prev.filter((s) => s !== v));

    // Exam type / level / passing year — driven by checkboxes, so kept outside react-hook-form.
    const [examType, setExamType] = useState('Annual');
    const [level, setLevel] = useState('Secondary');
    const [passingYear, setPassingYear] = useState('');

    const DEFAULT_FORM_VALUES = {
        student_name: '', father_name: '', mother_name: '', class: '', stream: '', session: '',
        date_of_birth: '', address: '', issue_date: '', character: 'Good',
        roll_code_no: '', roll_no: '', village: '', po: '', ps: '', district: '',
        result: 'Pass', additional_subjects: '', ref_no: '', gender: 'He',
        admission_number: '', section: '', leaving_date: '', reason_for_leaving: '',
    };
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
        defaultValues: DEFAULT_FORM_VALUES,
    });
    const selectedClass = watch('class');

    // ── Fetch students ──
    const fetchStudents = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
        setLoading(false);
        if (error) return toast.error('Failed to load students: ' + error.message);
        setStudents(data || []);
    };

    useEffect(() => { fetchStudents(); }, []);

    // ── Create / update ──
    const onSubmit = async (form) => {
        if (!examType || !level || !passingYear) {
            return toast.error('Select exam type, level, and passing year.');
        }
        setSaving(true);
        const payload = {
            ...form,
            school_id: school.id,
            certificate_type: certificateType,
            stream: form.class === 'XII' ? form.stream : null,
            subjects,
            signature: wantsSignature,
            passed: true,
            exam_type: examType,
            level: level,
            passing_year: Number(passingYear),
        };
        if (editingId) {
            const { error } = await supabase.from('students').update(payload).eq('id', editingId);
            setSaving(false);
            if (error) return toast.error('Update failed: ' + error.message);
            toast.success('Student updated successfully.');
        } else {
            const { error } = await supabase.from('students').insert({ ...payload, reg_no: genRegNo() });
            setSaving(false);
            if (error) return toast.error('Unable to save student. Please try again.');
            toast.success('Student saved successfully.');
        }
        reset(DEFAULT_FORM_VALUES);
        setSubjects([]);
        setExamType('Annual');
        setLevel('Secondary');
        setPassingYear('');
        setEditingId(null);
        fetchStudents();
    };

    const startEdit = (s) => {
        setEditingId(s.id);
        setSubjects(s.subjects || []);
        setExamType(s.exam_type || 'Annual');
        setLevel(s.level || 'Secondary');
        setPassingYear(s.passing_year || '');
        setCertificateType(s.certificate_type || 'character');
        reset({
            student_name: s.student_name, father_name: s.father_name, mother_name: s.mother_name,
            class: s.class, stream: s.stream || '', session: s.session, date_of_birth: s.date_of_birth,
            address: s.address || '', issue_date: s.issue_date, character: s.character || 'Good',
            roll_code_no: s.roll_code_no || '', roll_no: s.roll_no || '', village: s.village || '',
            additional_subjects: s.additional_subjects || '', po: s.po || '', ps: s.ps || '',
            district: s.district || '', result: s.result || 'Pass', ref_no: s.ref_no || '',
            gender: s.gender || 'He', admission_number: s.admission_number || '', section: s.section || '',
            leaving_date: s.leaving_date || '', reason_for_leaving: s.reason_for_leaving || '',
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setSubjects([]);
        setExamType('Annual');
        setLevel('Secondary');
        setPassingYear('');
        setCertificateType('character');
        reset(DEFAULT_FORM_VALUES);
    };

    // ── Delete ──
    const confirmDelete = async () => {
        if (!deleteTarget) return;
        const { error } = await supabase.from('students').delete().eq('id', deleteTarget.id);
        if (error) { toast.error('Delete failed: ' + error.message); setDeleteTarget(null); return; }
        toast.success('Student deleted.');
        setDeleteTarget(null);
        fetchStudents();
    };

    // ── Filtered list ──
    const filtered = useMemo(() => {
        return students.filter((s) => {
            const matchesSearch = !search || s.student_name?.toLowerCase().includes(search.toLowerCase()) || s.father_name?.toLowerCase().includes(search.toLowerCase());
            const matchesClass = !classFilter || s.class === classFilter;
            const matchesType = !typeFilter || (s.certificate_type || 'character') === typeFilter;
            return matchesSearch && matchesClass && matchesType;
        });
    }, [students, search, classFilter, typeFilter]);

    const classOptions = useMemo(() => [...new Set(students.map(s => s.class).filter(Boolean))], [students]);

    // ── View / download / print actions ──
    const openPreview = (student, action = null) => {
        setPreviewStudent({ ...student, regNo: student.reg_no || genRegNo() });
        setPendingAction(action);
    };

    useEffect(() => {
        if (!previewStudent || !pendingAction) return;
        // Wait a tick for the certificate DOM to paint before capturing it.
        const run = async () => {
            setBusy(true);
            try {
                const el = document.getElementById('slc-capture');
                if (!el) return;
                if (pendingAction === 'print') {
                    setBusy(false);
                    window.print();
                    return;
                }
                const canvas = await html2canvas(el, { scale: 3, useCORS: true, backgroundColor: '#fff' });
                if (pendingAction === 'png') {
                    const link = document.createElement('a');
                    link.download = `${CERTIFICATE_TYPES[previewStudent.certificate_type || 'character'].short}_${slug(previewStudent.student_name)}.png`;
                    link.href = canvas.toDataURL('image/png', 1.0);
                    link.click();
                    toast.success('Certificate image downloaded.');
                } else if (pendingAction === 'pdf') {
                    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
                    pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', 0, 0, 297, 210, undefined, 'FAST');
                    pdf.save(`${CERTIFICATE_TYPES[previewStudent.certificate_type || 'character'].short}_${slug(previewStudent.student_name)}.pdf`);
                    toast.success('Certificate PDF downloaded.');

                }
            } catch (err) {
                console.error('Certificate export failed:', err);
                toast.error('Could not generate the certificate file. Please try again.');
            } finally {
                setBusy(false);
                setPendingAction(null);
            }
        };
        const t = setTimeout(run, 150);
        return () => clearTimeout(t);
    }, [previewStudent, pendingAction]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 py-6 text-white">

            {/* Background glow */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#20d8ff]/10 blur-[120px]" />
                <div className="absolute -right-40 top-1/3 h-[500px] w-[500px] rounded-full bg-[#ff7cc0]/10 blur-[120px]" />
                <div className="absolute bottom-[-200px] left-1/3 h-[450px] w-[450px] rounded-full bg-[#8a5cff]/10 blur-[120px]" />

                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-6">

                {/* Top navigation */}
                <div className="mb-6 flex items-center justify-between">
                    <Link
                        to="/"
                        className="group inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm font-semibold text-slate-300 backdrop-blur-xl transition-all hover:border-[#20d8ff]/30 hover:bg-white/[0.1] hover:text-white"
                    >
                        <span className="transition-transform group-hover:-translate-x-1">
                            ←
                        </span>
                        Back to Home
                    </Link>

                    <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-slate-400 sm:flex">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                        Admin Portal
                    </div>
                </div>

                {/* School Header */}
                <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.07] shadow-2xl backdrop-blur-2xl">

                    {/* gradient */}
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,#15803D,#1D9E75,#132848)] opacity-90" />

                    <div className="absolute -right-20 -top-32 h-80 w-80 rounded-full bg-white/10 blur-3xl" />

                    <div className="relative flex flex-col items-center justify-between gap-6 p-7 sm:flex-row sm:p-9">

                        <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">

                            {/* Logo */}
                            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/10 p-2 shadow-xl backdrop-blur-md">
                                <img
                                    src={school?.logo}
                                    alt="School Logo"
                                    className="h-full w-full object-contain"
                                    style={{ borderRadius: '0.5rem' }}
                                />
                            </div>

                            <div>
                                <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-white/60">
                                    School Certificate Portal
                                </p>

                                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                                    {school?.school_name}
                                </h1>

                                <p className="mt-2 text-sm text-white/70">
                                    U-DISE
                                    <span className="ml-2 font-semibold text-white">
                                        {school?.u_dise_code}
                                    </span>
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={async () => {
                                    const { error } = await supabase.auth.signOut();

                                    if (error) {
                                        console.error(error.message);
                                        return;
                                    }

                                }}
                                className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 backdrop-blur-xl transition-all duration-300 hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
                            >
                                <LogOut
                                    size={17}
                                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                                />
                                <span>Sign Out</span>
                            </button>
                        </div>

                        {/* Status */}
                        <div className="rounded-2xl border border-white/10 bg-black/10 px-5 py-3 text-center backdrop-blur-md">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-white/50">
                                System Status
                            </p>

                            <div className="mt-1 flex items-center justify-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,.7)]" />
                                <span className="text-sm font-bold text-white">
                                    Active
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Certificate Type */}
                <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-2xl sm:p-6">

                    <div className="mb-4">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                            Certificate
                        </p>

                        <h2 className="mt-1 text-lg font-bold text-white">
                            Select Certificate Type
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Choose the document you want to create.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {Object.entries(CERTIFICATE_TYPES).map(([key, cfg]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setCertificateType(key)}
                                className={`group relative overflow-hidden rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${certificateType === key
                                    ? "border-transparent bg-[linear-gradient(100deg,#20d8ff,#8a5cff_50%,#ff7cc0)] text-white shadow-lg shadow-purple-500/20 scale-[1.02]"
                                    : "border-white/10 bg-white/[0.04] text-slate-400 hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
                                    }`}
                            >
                                {certificateType === key && (
                                    <div className="absolute right-3 top-3 h-2 w-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                                )}

                                <div className="text-xs font-bold uppercase tracking-wider opacity-60">
                                    Certificate
                                </div>

                                <div className="mt-1 text-sm font-extrabold">
                                    {cfg.short}
                                </div>

                                <div className="mt-1 text-xs opacity-70">
                                    {cfg.label}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
                {/* Form */}
                {/* Student Form */}
                <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur-2xl">

                    {/* top gradient line */}
                    <div className="absolute left-0 right-0 top-0 h-[2px] bg-[linear-gradient(90deg,#20d8ff,#8a5cff,#ff7cc0)]" />

                    <div className="p-6 sm:p-8">

                        <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-1 rounded-full bg-[linear-gradient(#20d8ff,#ff7cc0)]" />

                                    <h2 className="text-lg font-extrabold text-white">
                                        {editingId ? "Edit Student" : "Add New Student"}
                                    </h2>
                                </div>

                                <p className="mt-2 text-xs leading-5 text-slate-500">
                                    {editingId
                                        ? "Update the student's information below."
                                        : "Fill in the student's details to save the record and generate a certificate."
                                    }
                                </p>
                            </div>

                            <div className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-400">
                                {certificateType
                                    ? CERTIFICATE_TYPES[certificateType]?.label
                                    : "Certificate"
                                }
                            </div>
                        </div>

                        {/* YOUR EXISTING FORM HERE */}

                        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <Field label="Student Name" error={errors.student_name}>
                                <input type="text" placeholder="e.g. Budhu Soren" {...register('student_name', { required: true })} className="input" />
                            </Field>
                            <Field label="Father Name" error={errors.father_name}>
                                <input type="text" placeholder="e.g. Somay Soren" {...register('father_name', { required: true })} className="input" />
                            </Field>
                            <Field label="Mother Name" error={errors.mother_name}>
                                <input type="text" placeholder="Mother's name" {...register('mother_name', { required: true })} className="input" />
                            </Field>
                            <Field label="Class" error={errors.class}>
                                <select {...register('class', { required: true })} className="input">
                                    <option value="">Select class</option>
                                    {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </Field>
                            {selectedClass === 'XII' && (
                                <Field label="Stream" error={errors.stream}>
                                    <select {...register('stream', { required: selectedClass === 'XII' })} className="input">
                                        <option value="">Select stream</option>
                                        {STREAM_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </Field>
                            )}
                            <Field label="Session" error={errors.session}>
                                <input type="text" placeholder="e.g. 2025-27" {...register('session', { required: true })} className="input" />
                            </Field>
                            <Field label="Date of Birth" error={errors.date_of_birth}>
                                <input type="date" {...register('date_of_birth', { required: true })} className="input" />
                            </Field>
                            <Field label="Issue Date" error={errors.issue_date}>
                                <input type="date" {...register('issue_date', { required: true })} className="input" />
                            </Field>
                            <Field label="Character">
                                <select {...register('character')} className="input">
                                    {CHARACTER_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </Field>
                            <Field label="Address">
                                <textarea rows={1} placeholder="Village, Post, P.S., District" {...register('address')} className="input resize-none" />
                            </Field>
                            {(certificateType === 'slc' || certificateType === 'bonafide') && (
                                <>
                                    <Field label="Village"><input type="text" {...register('village')} className="input" /></Field>
                                    <Field label="P.O."><input type="text" {...register('po')} className="input" /></Field>
                                    <Field label="P.S."><input type="text" {...register('ps')} className="input" /></Field>
                                    <Field label="District"><input type="text" {...register('district')} className="input" /></Field>
                                </>
                            )}
                            {certificateType === 'slc' && (
                                <>
                                    <Field label="Roll Code No."><input type="text" {...register('roll_code_no')} className="input" /></Field>
                                    <Field label="Roll No."><input type="text" {...register('roll_no')} className="input" /></Field>
                                    <Field label="Result">
                                        <select {...register('result')} className="input">
                                            <option>Pass</option><option>Fail</option>
                                        </select>
                                    </Field>
                                    <Field label="Additional Subjects"><input type="text" placeholder="e.g. Sanskrit" {...register('additional_subjects')} className="input" /></Field>
                                </>
                            )}
                            {certificateType === 'bonafide' && (
                                <>
                                    <Field label="Ref. No."><input type="text" {...register('ref_no')} className="input" /></Field>
                                    <Field label="Gender">
                                        <select {...register('gender')} className="input">
                                            <option value="He">He</option><option value="She">She</option>
                                        </select>
                                    </Field>
                                </>
                            )}
                            {certificateType === 'tc' && (
                                <>
                                    <Field label="Admission Number"><input type="text" {...register('admission_number')} className="input" /></Field>
                                    <Field label="Section"><input type="text" placeholder="e.g. A" {...register('section')} className="input" /></Field>
                                    <Field label="Leaving Date"><input type="date" {...register('leaving_date')} className="input" /></Field>
                                    <Field label="Reason for Leaving"><input type="text" placeholder="e.g. Family relocation" {...register('reason_for_leaving')} className="input" /></Field>
                                </>
                            )}
                            {certificateType !== 'tc' && <div className="sm:col-span-2">
                                <label className="text-xs font-bold text-foreground block mb-1.5">Subjects</label>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Type a subject and press Enter" value={subjectInput}
                                        onChange={(e) => setSubjectInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addSubject(); } }}
                                        className="input flex-1" />
                                    <button type="button" onClick={addSubject} className="rounded-xl px-4 text-sm font-bold border border-input hover:bg-muted">Add</button>
                                </div>
                                {subjects.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        {subjects.map((s) => (
                                            <span key={s} className="rounded-full bg-[#25d366cc] px-4 py-2 text-sm font-bold text-white shadow">
                                                {s}
                                                <button type="button" onClick={() => removeSubject(s)} className="hover:text-red-600 pl-1"><X className="h-3 w-3" /></button>
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>}
                            <div className="sm:col-span-2">
                                <label className="flex items-center gap-2.5 cursor-pointer mb-4">
                                    <input
                                        type="checkbox"
                                        checked={wantsSignature}
                                        onChange={(e) => setWantsSignature(e.target.checked)}
                                        className="h-4 w-4 rounded border-white/20 accent-[#20d8ff]"
                                    />
                                    <span className="text-sm font-semibold text-slate-300">Do you want to attach a signature?</span>
                                </label>
                                {wantsSignature && (
                                    <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.06] p-5 shadow-xl backdrop-blur-2xl sm:p-6">
                                        <div className="mb-4">
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Optional</p>
                                            <h2 className="mt-1 text-lg font-bold text-white">Digital Signature</h2>
                                            <p className="mt-1 text-xs text-slate-500">
                                                Add a signature to appear on generated certificates, or leave it off to use a blank signature line.
                                            </p>
                                        </div>
                                        <>
                                            {school.signature_url && (
                                                <div className="mb-4 flex items-center gap-3">
                                                    <span className="text-xs text-slate-500">Current signature:</span>
                                                    <img src={school.signature_url} alt="Current signature" className="h-12 border border-white/10 rounded-lg bg-white p-1" />
                                                </div>
                                            )}

                                            <SignaturePad
                                                school={school}
                                                onSaved={(url) => { school.signature_url = url; }}
                                            />
                                        </>
                                    </div>)}
                            </div>
                            <div className="sm:col-span-2">
                                <label className="text-xs font-bold text-foreground block mb-1.5">Examination</label>
                                <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-foreground rounded-xl border border-input px-3.5 py-2.5">
                                    <span className="font-semibold">Passed</span>

                                    {EXAM_TYPE_OPTIONS.map((opt) => (
                                        <label key={opt} className="flex items-center gap-1 font-medium">
                                            <input type="checkbox" checked={examType === opt}
                                                onChange={() => setExamType(examType === opt ? '' : opt)}
                                                className="h-3.5 w-3.5" />
                                            {opt}
                                        </label>
                                    ))}

                                    <span>/</span>

                                    {LEVEL_OPTIONS.map((opt) => (
                                        <label key={opt} className="flex items-center gap-1 font-medium">
                                            <input type="checkbox" checked={level === opt}
                                                onChange={() => setLevel(level === opt ? '' : opt)}
                                                className="h-3.5 w-3.5" />
                                            {opt}
                                        </label>
                                    ))}

                                    <span>examination conducted by the Jharkhand Academic Council, Ranchi.</span>

                                    <span className="flex items-center gap-1.5 font-semibold">
                                        Year:
                                        <select value={passingYear} onChange={(e) => setPassingYear(e.target.value)}
                                            className="rounded-lg border border-input px-2 py-1 text-sm">
                                            <option value="">—</option>
                                            {PASSING_YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
                                        </select>
                                    </span>
                                </div>
                            </div>

                            <div className="sm:col-span-2 flex gap-2 mt-1">
                                <button type="submit" disabled={saving}
                                    className="group relative mt-2 flex h-13 w-full items-center justify-center overflow-hidden rounded-xl bg-[linear-gradient(100deg,#20d8ff,#8a5cff_50%,#ff7cc0)] text-sm font-bold text-white shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-[1.015] hover:shadow-xl hover:shadow-purple-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? 'Saving...' : editingId ? 'Update Student' : 'Save Student'}
                                </button>
                                {editingId && (
                                    <button type="button" onClick={cancelEdit} className="rounded-xl px-4 py-2.5 text-sm font-bold border border-input hover:bg-muted transition-all">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="mb-4 rounded-3xl border border-white/10 bg-white/[0.06] p-4 shadow-xl backdrop-blur-2xl sm:p-5">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                        {/* Search */}
                        <div className="relative w-full lg:max-w-md">

                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

                            <input
                                type="text"
                                placeholder="Search student or father name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.05] pl-11 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#20d8ff]/50 focus:bg-white/[0.08] focus:ring-4 focus:ring-[#20d8ff]/10"
                            />
                        </div>

                        {/* Filters */}
                        <div className="flex flex-col gap-2 sm:flex-row">

                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <span className="hidden sm:inline">
                                    FILTER
                                </span>
                            </div>

                            <select
                                value={classFilter}
                                onChange={(e) => setClassFilter(e.target.value)}
                                className="input h-11 sm:w-44"
                            >
                                <option value="">All Classes</option>

                                {classOptions.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="input h-11 sm:w-56"
                            >
                                <option value="">All Certificate Types</option>

                                {Object.entries(CERTIFICATE_TYPES).map(([key, cfg]) => (
                                    <option key={key} value={key}>
                                        {cfg.short} — {cfg.label}
                                    </option>
                                ))}
                            </select>

                        </div>
                    </div>
                </div>


                {/* Student list */}
                <div className="glass-card overflow-hidden">
                    {loading ? (
                        <div className="p-8 text-center text-sm text-muted-foreground">Loading students...</div>
                    ) : filtered.length === 0 ? (
                        <div className="p-10 text-center">
                            <GraduationCap className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-20" />
                            <p className="text-sm font-bold text-muted-foreground">No students found.</p>
                            <p className="text-xs text-muted-foreground mt-1">Add a student above to generate a certificate.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-input text-left text-xs uppercase tracking-wide text-muted-foreground">
                                        <th className="px-4 py-3 font-bold">Student</th>
                                        <th className="px-4 py-3 font-bold">Father</th>
                                        <th className="px-4 py-3 font-bold">Class</th>
                                        <th className="px-4 py-3 font-bold">Session</th>
                                        <th className="px-4 py-3 font-bold">Issue Date</th>
                                        <th className="px-4 py-3 font-bold">Type</th>
                                        <th className="px-4 py-3 font-bold text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((s) => (
                                        <tr key={s.id} className="border-b border-input last:border-0 hover:bg-muted/50">
                                            <td className="px-4 py-3 font-semibold text-foreground">{titleCase(s.student_name)}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{titleCase(s.father_name)}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{s.class}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{s.session}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{formatDate(s.issue_date)}</td>
                                            <td className="px-4 py-3 text-muted-foreground">{CERTIFICATE_TYPES[s.certificate_type || 'character']?.short}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <IconBtn title="View" onClick={() => openPreview(s)}><Eye className="h-3.5 w-3.5" /></IconBtn>
                                                    <IconBtn title="Download PNG" onClick={() => openPreview(s, 'png')}><ImageIcon className="h-3.5 w-3.5" /></IconBtn>
                                                    <IconBtn title="Download PDF" onClick={() => openPreview(s, 'pdf')}><FileText className="h-3.5 w-3.5" /></IconBtn>
                                                    <IconBtn title="Print" onClick={() => openPreview(s, 'print')}><Printer className="h-3.5 w-3.5" /></IconBtn>
                                                    <IconBtn title="Edit" onClick={() => startEdit(s)}><Pencil className="h-3.5 w-3.5" /></IconBtn>
                                                    <IconBtn title="Delete" danger onClick={() => setDeleteTarget(s)}><Trash2 className="h-3.5 w-3.5" /></IconBtn>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {previewStudent && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:bg-white print:p-0"
                        id="slc-modal"
                    >
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col print:shadow-none print:rounded-none print:max-w-none print:max-h-none">
                            <div className="flex items-center justify-between px-5 py-3 border-b border-input print:hidden shrink-0">
                                <h3 className="text-sm font-extrabold text-foreground">Certificate Preview</h3>
                                <button onClick={() => setPreviewStudent(null)} className="p-1.5 rounded-lg bg-black text-white"><X className="h-4 w-4" /></button>
                            </div>

                            {/* Visible, responsively scaled — for the user's eyes only, never captured */}
                            <div className="p-4 overflow-auto flex justify-center items-start flex-1" ref={modalBodyRef}>
                                <div style={{ width: certWidthPx * scale, height: certHeightPx * scale, overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                                    <div style={{ position: 'absolute', top: 0, left: 0, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                                        <CertificateDocument data={previewStudent} school={school} />
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 px-5 py-4 border-t border-input print:hidden shrink-0">
                                <button disabled={busy} onClick={() => openPreview(previewStudent, 'png')}
                                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg,#132848,#2c4a7c)' }}>
                                    <Download className="h-3.5 w-3.5" /> PNG
                                </button>
                                <button disabled={busy} onClick={() => openPreview(previewStudent, 'pdf')}
                                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg,#c9a227,#b1891a)' }}>
                                    <Download className="h-3.5 w-3.5" /> PDF
                                </button>
                                <button disabled={busy} onClick={() => openPreview(previewStudent, 'print')}
                                    className="flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg,#4a5568,#2d3748)' }}>
                                    <Printer className="h-3.5 w-3.5" /> Print
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Hidden, full-scale, unrotated capture target — kept as a top-level sibling, never inside a
    fixed/transformed ancestor, so html2canvas measures and renders it reliably */}
                {previewStudent && (
                    <div style={{ position: 'absolute', top: 0, left: 0, height: 0, overflow: 'hidden', zIndex: -1 }} aria-hidden="true">
                        <CertificateDocument data={previewStudent} school={school} captureId="slc-capture" />
                    </div>
                )}

                {/* Delete confirmation */}
                {deleteTarget && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="bg-black rounded-2xl shadow-2xl w-full max-w-sm p-6">
                            <h3 className="text-base font-extrabold text-foreground mb-2">Delete this student?</h3>
                            <p className="text-sm text-muted-foreground mb-5">
                                This will permanently remove <strong>{titleCase(deleteTarget.student_name)}</strong>'s record. This action cannot be undone.
                            </p>
                            <div className="flex gap-2 justify-end">
                                <button onClick={() => setDeleteTarget(null)} className="rounded-xl px-4 py-2 text-sm font-bold border border-input hover:bg-muted">Cancel</button>
                                <button onClick={confirmDelete} className="rounded-xl px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700">Delete</button>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
    .input {
        width: 100%;
        height: 46px;
        border-radius: 12px;
        border: 1px solid rgba(255,255,255,0.10);
        background: rgba(255,255,255,0.045);
        color: white;
        padding: 0.65rem 0.9rem;
        font-size: 0.875rem;
        outline: none;
        transition: all 0.2s ease;
    }

    .input::placeholder {
        color: rgba(148,163,184,0.55);
    }

    .input:hover {
        border-color: rgba(255,255,255,0.18);
        background: rgba(255,255,255,0.065);
    }

    .input:focus {
        border-color: rgba(32,216,255,0.55);
        background: rgba(255,255,255,0.07);
        box-shadow:
            0 0 0 3px rgba(32,216,255,0.08),
            0 0 25px rgba(32,216,255,0.05);
    }

    .input option {
        background: #0f172a;
        color: white;
    }

    textarea.input {
        min-height: 46px;
    }
`}</style>
            </div>
        </div>
    );
}

// ── Small helpers ──
function Field({ label, error, children }) {
    return (
        <div>
            <label className="text-xs font-bold text-foreground block mb-1.5">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1">Required</p>}
        </div>
    );
}

function IconBtn({ children, title, onClick, danger }) {
    return (
        <button type="button" title={title} onClick={onClick}
            className={`h-7 w-7 flex items-center justify-center rounded-lg border transition-colors ${danger ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-input text-muted-foreground hover:bg-muted'}`}>
            {children}
        </button>
    );
}

export default function SchoolLeavingCertificatePage() {
    return (
        <AuthGate>
            {({ session, school }) => <SchoolLeavingCertificate session={session} school={school} />}
        </AuthGate>
    );
}