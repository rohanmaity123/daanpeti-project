import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, AlertCircle, LogIn, Lock, ArrowLeft, Droplets, Clock, Phone, Mail, MapPin, User } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { LocationAutocomplete } from '../../components/LocationAutocomplete';
import { Helmet } from 'react-helmet';
import { signInWithGoogle, useAuth } from '../../hooks/useAuth';

/* ── Constants ──────────────────────────────────────────────────────────── */
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const WEEKDAYS = [
    { key: 'mon', label: 'Mon' },
    { key: 'tue', label: 'Tue' },
    { key: 'wed', label: 'Wed' },
    { key: 'thu', label: 'Thu' },
    { key: 'fri', label: 'Fri' },
    { key: 'sat', label: 'Sat' },
    { key: 'sun', label: 'Sun' },
];

const TIME_SLOTS = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00',
    '20:00', '21:00', '22:00',
];

/* ── Zod schema ─────────────────────────────────────────────────────────── */
const schema = z.object({
    full_name: z.string().min(2, 'Enter your full name'),
    blood_group: z.string().min(1, 'Select your blood group'),
    email: z.string().email('Enter a valid email'),
    phone: z.string().length(10, 'Enter a valid 10-digit number').regex(/^\d+$/, 'Only digits'),
    alt_phone: z.string().max(10).regex(/^\d*$/, 'Only digits').optional().or(z.literal('')),
    location: z.string().min(2, 'Please select a location'),
    pincode: z.string().length(6, 'Must be 6 digits').regex(/^\d+$/, 'Only digits'),
    available_days: z.array(z.string()).min(1, 'Select at least one day'),
    start_time: z.string().min(1, 'Select start time'),
    end_time: z.string().min(1, 'Select end time'),
    notes: z.string().max(200).optional(),
});

const fieldVariants = {
    hidden: { opacity: 0, y: 14 },
    show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.06 * i, duration: 0.28, ease: 'easeOut' } }),
};

/* ── Login wall (same pattern as PostItemPage) ───────────────────────────── */
function LoginWall() {
    const [loading, setLoading] = useState(false);
    const handleLogin = async () => { setLoading(true); try { await signInWithGoogle(); } catch { setLoading(false); } };
    return (
        <div className="mx-auto max-w-sm px-4 pt-10 pb-28 text-center">
            <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }} className="rounded-2xl bg-card card-shadow p-8">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                    <Droplets className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-extrabold text-foreground">Login Karein 🙏</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Blood donor register karne ke liye pehle login karein.
                </p>
                <motion.button onClick={handleLogin} disabled={loading} whileTap={{ scale: 0.97 }}
                    className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Redirecting...</>
                        : <><LogIn className="h-4 w-4" />Sign in with Google</>}
                </motion.button>
            </motion.div>
        </div>
    );
}

/* ── Field error (same as PostItemPage) ─────────────────────────────────── */
function FieldError({ msg }) {
    return (
        <AnimatePresence>
            {msg && (
                <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    className="mt-1 text-xs text-destructive font-medium flex items-center gap-1">
                    <AlertCircle className="h-3 w-3 shrink-0" />{msg}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function BloodBankPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [submitState, setSubmitState] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [resolvedPlace, setResolvedPlace] = useState(null);
    const [fetchingExisting, setFetchingExisting] = useState(true);

    const inputClass = 'mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow';

    const { register, handleSubmit, control, setValue, reset, watch, formState: { errors } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { available_days: [], start_time: '', end_time: '' },
    });

    const selectedDays = watch('available_days') || [];

    /* ── Load existing registration if user already submitted ─────────────── */
    useEffect(() => {
        if (!user) return;
        const load = async () => {
            const { data } = await supabase
                .from('blood_donors')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (data) {
                setIsEditMode(true);
                reset({
                    full_name: data.full_name,
                    blood_group: data.blood_group,
                    email: data.email,
                    phone: data.phone,
                    alt_phone: data.alt_phone ?? '',
                    location: data.location,
                    pincode: data.pincode,
                    available_days: data.available_days ?? [],
                    start_time: data.start_time,
                    end_time: data.end_time,
                    notes: data.notes ?? '',
                });
            }
            setFetchingExisting(false);
        };
        load();
    }, [user]);

    if (!user && !authLoading) return <LoginWall />;

    /* ── Gates ───────────────────────────────────────────────────────────── */
    if (authLoading || fetchingExisting) return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-destructive" />
        </div>
    );

    /* ── Helpers ─────────────────────────────────────────────────────────── */
    const handlePlaceSelect = (details) => {
        setResolvedPlace(details);
        if (details.pincode) setValue('pincode', details.pincode, { shouldValidate: true });
    };

    const toggleDay = (day) => {
        const curr = selectedDays;
        const next = curr.includes(day) ? curr.filter(d => d !== day) : [...curr, day];
        setValue('available_days', next, { shouldValidate: true });
    };

    /* ── Submit ──────────────────────────────────────────────────────────── */
    const onSubmit = async (values) => {
        setSubmitState('loading');
        setErrorMsg('');
        try {
            const payload = {
                user_id: user.id,
                full_name: values.full_name,
                blood_group: values.blood_group,
                email: values.email,
                phone: values.phone,
                alt_phone: values.alt_phone || null,
                location: values.location,
                pincode: values.pincode,
                city: resolvedPlace?.city ?? '',
                state: resolvedPlace?.state ?? '',
                lat: resolvedPlace?.lat ?? null,
                lng: resolvedPlace?.lng ?? null,
                available_days: values.available_days,
                start_time: values.start_time,
                end_time: values.end_time,
                notes: values.notes || null,
                is_available: true,
            };

            if (isEditMode) {
                const { error } = await supabase
                    .from('blood_donors')
                    .update(payload)
                    .eq('user_id', user.id);
                if (error) throw new Error(error.message);
            } else {
                const { error } = await supabase
                    .from('blood_donors')
                    .insert(payload);
                if (error) throw new Error(error.message);
            }

            setSubmitState('success');
            setTimeout(() => navigate('/digital-blood-bank/find'), 1500);
        } catch (err) {
            setSubmitState('error');
            setErrorMsg(err?.message ?? 'Something went wrong. Please try again.');
        }
    };

    return (
        <>
            <Helmet>
                <title>{isEditMode ? 'Edit Blood Donor — DaanGuru' : 'Register as Blood Donor — DaanGuru Digital Blood Bank'}</title>
                <meta name="description" content="Register as a blood donor on DaanGuru's Digital Blood Bank. Help save lives near you." />
                <link rel="canonical" href="https://www.daanguru.in/digital-blood-bank" />
            </Helmet>

            <div className="mx-auto max-w-3xl px-4 pt-5 pb-28 lg:pb-10">

                {/* ── Heading ── */}
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                    <Link to="/" className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">
                        <ArrowLeft className="h-4 w-4" />Back to Home
                    </Link>

                    <div className="glass-card p-6 lg:p-8 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E24B4A] via-[#ff8a80] to-[#E24B4A]" />
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                                style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                                <Droplets className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground">
                                    {isEditMode ? '✏️ Update Profile' : 'Digital Blood Bank 🩸'}
                                </h1>
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {isEditMode ? 'Update your donor details anytime.' : 'Register once. Save lives near you. 💪'}
                                </p>
                            </div>
                        </div>
                        {isEditMode ? (
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                                style={{ background: 'rgba(239,159,39,0.12)', color: '#ef9f27' }}>
                                ✏️ Edit mode — changes will update your donor listing
                            </div>
                        ) : (
                            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                                style={{ background: 'rgba(226,75,74,0.1)', color: '#E24B4A' }}>
                                ✅ Logged in as {user.email}
                            </div>
                        )}
                    </div>
                </motion.div>

                <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-5 lg:space-y-0">

                        {/* ── Left column ── */}
                        <div className="space-y-4">

                            {/* Personal info card */}
                            <div className="glass-card  p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="h-4 w-4" style={{ color: '#E24B4A' }} />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Personal Info</p>
                                </div>

                                <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="show">
                                    <label className="text-sm font-bold text-foreground">Full Name *</label>
                                    <input type="text" placeholder="e.g. Rahul Sharma"
                                        {...register('full_name')} className={inputClass} />
                                    <FieldError msg={errors.full_name?.message} />
                                </motion.div>

                                {/* Blood group picker */}
                                <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="show" className="mt-4">
                                    <label className="text-sm font-bold text-foreground">Blood Group *</label>
                                    <Controller name="blood_group" control={control} defaultValue=""
                                        render={({ field }) => (
                                            <div className="mt-1.5 grid grid-cols-4 gap-2">
                                                {BLOOD_GROUPS.map(bg => (
                                                    <button key={bg} type="button"
                                                        onClick={() => field.onChange(bg)}
                                                        className="rounded-xl py-2 text-sm font-bold transition-all active:scale-95"
                                                        style={{
                                                            background: field.value === bg ? 'linear-gradient(135deg,#E24B4A,#c0392b)' : 'none',
                                                            color: field.value === bg ? '#fff' : 'var(--color-text-secondary)',
                                                            border: field.value === bg ? 'none' : '0.5px solid #e0dfd8',
                                                        }}>
                                                        {bg}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    />
                                    <FieldError msg={errors.blood_group?.message} />
                                </motion.div>
                            </div>

                            {/* Contact card */}
                            <div className="glass-card p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Phone className="h-4 w-4" style={{ color: '#E24B4A' }} />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Contact Details</p>
                                </div>

                                <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="show">
                                    <label className="text-sm font-bold text-foreground">Email *</label>
                                    <input type="email" placeholder="you@example.com"
                                        {...register('email')} className={inputClass} />
                                    <FieldError msg={errors.email?.message} />
                                </motion.div>

                                <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="show" className="mt-4">
                                    <label className="text-sm font-bold text-foreground">Phone Number *</label>
                                    <div className="mt-1.5 flex items-center rounded-xl border border-input bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                        <span className="px-3 py-2.5 text-sm text-muted-foreground border-r border-input select-none bg-muted/30">+91</span>
                                        <input type="tel" inputMode="numeric" placeholder="9876543210" maxLength={10}
                                            {...register('phone')}
                                            className="flex-1 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent" />
                                    </div>
                                    <FieldError msg={errors.phone?.message} />
                                </motion.div>

                                <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="show" className="mt-4">
                                    <label className="text-sm font-bold text-foreground">
                                        Alternative Number
                                        <span className="ml-1 text-[10px] font-normal text-muted-foreground">(optional)</span>
                                    </label>
                                    <div className="mt-1.5 flex items-center rounded-xl border border-input bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                        <span className="px-3 py-2.5 text-sm text-muted-foreground border-r border-input select-none bg-muted/30">+91</span>
                                        <input type="tel" inputMode="numeric" placeholder="9876543210" maxLength={10}
                                            {...register('alt_phone')}
                                            className="flex-1 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent" />
                                    </div>
                                    <FieldError msg={errors.alt_phone?.message} />
                                </motion.div>
                            </div>
                        </div>

                        {/* ── Right column ── */}
                        <div className="space-y-4">

                            {/* Location card */}
                            <div className="border border-input rounded-xl p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <MapPin className="h-4 w-4" style={{ color: '#E24B4A' }} />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Location</p>
                                </div>

                                <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="show">
                                    <label className="text-sm font-bold text-foreground">
                                        Your Location *
                                        <span className="ml-2 text-[10px] font-normal text-muted-foreground normal-case">(Google autocomplete)</span>
                                    </label>
                                    <div className="mt-1.5 relative z-50">
                                        <Controller name="location" control={control} defaultValue=""
                                            render={({ field }) => (
                                                <LocationAutocomplete
                                                    value={field.value}
                                                    onChange={(val) => { field.onChange(val); if (!val) setResolvedPlace(null); }}
                                                    onPlaceSelect={handlePlaceSelect}
                                                    error={errors.location?.message}
                                                    placeholder="e.g. Salt Lake, Kolkata..."
                                                />
                                            )}
                                        />
                                    </div>
                                    <FieldError msg={errors.location?.message} />
                                    {resolvedPlace?.city && (
                                        <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                                            className="mt-2 flex flex-wrap gap-2">
                                            {[resolvedPlace.city && `🏙 ${resolvedPlace.city}`, resolvedPlace.state && `📍 ${resolvedPlace.state}`]
                                                .filter(Boolean).map(tag => (
                                                    <span key={tag} className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                                        style={{ background: 'rgba(226,75,74,0.08)', color: '#E24B4A' }}>{tag}</span>
                                                ))}
                                        </motion.div>
                                    )}
                                </motion.div>

                                <motion.div custom={7} variants={fieldVariants} initial="hidden" animate="show" className="mt-4">
                                    <label className="text-sm font-bold text-foreground">
                                        Pincode *
                                        {resolvedPlace?.pincode && <span className="ml-2 text-[10px] font-normal text-destructive">Auto-filled ✓</span>}
                                    </label>
                                    <input type="text" inputMode="numeric" placeholder="e.g. 734001" maxLength={6}
                                        {...register('pincode')} className={inputClass} />
                                    <FieldError msg={errors.pincode?.message} />
                                </motion.div>
                            </div>

                            {/* Availability card */}
                            <div className="glass-card p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="h-4 w-4" style={{ color: '#E24B4A' }} />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Availability</p>
                                </div>

                                {/* Day selector */}
                                <motion.div custom={8} variants={fieldVariants} initial="hidden" animate="show">
                                    <label className="text-sm font-bold text-foreground">Available Days *</label>
                                    <div className="mt-1.5 flex gap-1.5 flex-wrap">
                                        {WEEKDAYS.map(({ key, label }) => (
                                            <button key={key} type="button"
                                                onClick={() => toggleDay(key)}
                                                className="rounded-xl px-3 py-1.5 text-xs font-bold transition-all active:scale-95"
                                                style={{
                                                    background: selectedDays.includes(key) ? 'linear-gradient(135deg,#E24B4A,#c0392b)' : 'none',
                                                    color: selectedDays.includes(key) ? '#fff' : 'var(--color-text-secondary)',
                                                    border: selectedDays.includes(key) ? 'none' : '0.5px solid #e0dfd8',
                                                }}>
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    <FieldError msg={errors.available_days?.message} />
                                </motion.div>

                                {/* Time range */}
                                <motion.div custom={9} variants={fieldVariants} initial="hidden" animate="show" className="mt-4 grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-sm font-bold text-foreground">Start Time *</label>
                                        <select {...register('start_time')} className={inputClass}>
                                            <option value="">From...</option>
                                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <FieldError msg={errors.start_time?.message} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-bold text-foreground">End Time *</label>
                                        <select {...register('end_time')} className={inputClass}>
                                            <option value="">To...</option>
                                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                        <FieldError msg={errors.end_time?.message} />
                                    </div>
                                </motion.div>

                                {/* Notes */}
                                <motion.div custom={10} variants={fieldVariants} initial="hidden" animate="show" className="mt-4">
                                    <label className="text-sm font-bold text-foreground">
                                        Notes
                                        <span className="ml-1 text-[10px] font-normal text-muted-foreground">(optional, max 200 chars)</span>
                                    </label>
                                    <textarea rows={2} maxLength={200}
                                        placeholder="e.g. Call before visiting, prefer morning..."
                                        {...register('notes')} className={`${inputClass} resize-none`} />
                                </motion.div>
                            </div>
                        </div>
                    </div>

                    {/* Error banner */}
                    <AnimatePresence>
                        {submitState === 'error' && (
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                                className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/15 border border-destructive/30 px-4 py-3">
                                <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                                <p className="text-sm text-destructive font-medium">{errorMsg}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Submit */}
                    <div className="mt-6">
                        <motion.button type="submit"
                            disabled={submitState === 'loading' || submitState === 'success'}
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }} whileTap={{ scale: 0.97 }}
                            className="w-full rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: 'linear-gradient(135deg,#E24B4A,#c0392b)' }}>
                            {submitState === 'loading' && <><Loader2 className="h-4 w-4 animate-spin" />{isEditMode ? 'Saving...' : 'Registering...'}</>}
                            {submitState === 'success' && <><CheckCircle2 className="h-4 w-4" />{isEditMode ? 'Updated! Redirecting...' : 'Registered! Redirecting...'}</>}
                            {(submitState === 'idle' || submitState === 'error') && (
                                isEditMode ? '💾 Save Changes' : '🩸 Register as Blood Donor'
                            )}
                        </motion.button>

                        {isEditMode && (
                            <Link to="/digital-blood-bank/find"
                                className="mt-3 w-full rounded-xl py-3 px-6 text-sm font-semibold text-foreground flex items-center justify-center transition-colors hover:bg-muted"
                                style={{ border: '0.5px solid #e0dfd8' }}>
                                Cancel — Back to Find Donors
                            </Link>
                        )}
                    </div>
                </form>
            </div>
        </>
    );
}