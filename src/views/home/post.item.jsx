import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Loader2, CheckCircle2, AlertCircle, X, LogIn, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useAuth, signInWithGoogle } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ShareDonationModal from '../../components/ShareDonationModal';


const schema = z.object({
    donor_name: z.string().min(2, 'Enter your name'),
    name: z.string().min(3, 'Item name must be at least 3 characters'),
    category: z.string().min(1, 'Please select a category'),
    description: z.string().optional(),
    pincode: z.string().length(6, 'Pincode must be exactly 6 digits').regex(/^\d+$/, 'Pincode must be numeric'),
    location: z.string().min(2, 'Please provide a more specific location'),
    whatsapp_number: z.string().min(10, 'Enter a valid 10-digit number').max(13, 'Number too long').regex(/^\d+$/, 'Only digits allowed'),
});

const categories = [
    { value: 'clothes', label: '👕 Kapde / Clothes' },
    { value: 'furniture', label: '🪑 Furniture' },
    { value: 'books', label: '📚 Kitaabein / Books' },
    { value: 'electronics', label: '📱 Electronics' },
    { value: 'toys', label: '🧸 Khilone / Toys' },
    { value: 'kitchen', label: '🍳 Rasoi / Kitchen' },
    { value: 'other', label: '📦 Other' },
];

const fieldVariants = {
    hidden: { opacity: 0, y: 14 },
    show: (i) => ({ opacity: 1, y: 0, transition: { delay: 0.07 * i, duration: 0.28, ease: 'easeOut' } }),
};

/* ── Login wall ── */
function LoginWall() {
    const [loading, setLoading] = useState(false);
    const handleLogin = async () => {
        setLoading(true);
        try { await signInWithGoogle(); } catch { setLoading(false); }
    };

    return (
        <div className="mx-auto max-w-sm px-4 pt-10 pb-28 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="rounded-2xl bg-card card-shadow p-8"
            >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl"
                    style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                    <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-extrabold text-foreground">Login Karein 🙏</h2>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    Item post karne ke liye pehle login karein. Bilkul free hai!
                </p>
                <div className="mt-5 space-y-2 text-left">
                    {['✅ Apne items manage karein', '📦 Donation history dekhein', '🔔 Claim notifications paayein', '🆓 Hamesha free'].map(l => (
                        <p key={l} className="text-xs text-muted-foreground font-medium">{l}</p>
                    ))}
                </div>
                <motion.button onClick={handleLogin} disabled={loading} whileTap={{ scale: 0.97 }}
                    className="mt-6 w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                    {loading ? <><Loader2 className="h-4 w-4 animate-spin" />Redirecting...</> : <><LogIn className="h-4 w-4" />Sign in with Google</>}
                </motion.button>
                <p className="mt-3 text-xs text-muted-foreground">Google account se safe login</p>
            </motion.div>
        </div>
    );
}

/* ── Main page ── */
export default function PostItemPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitState, setSubmitState] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const fileInputRef = useRef(null);
    const [afterpostdata, setAfterPostData] = useState(null)

    const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
        resolver: zodResolver(schema),
    });

    if (authLoading) return (
        <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    if (!user) return <LoginWall />;

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) { setErrorMsg('Image must be under 5 MB'); return; }
        setErrorMsg('');
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImageFile(null); setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const uploadImage = async (file) => {
        const ext = file.name.split('.').pop();
        const path = `items/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('item-images').upload(path, file, { cacheControl: '3600', upsert: false });
        if (error) throw new Error(error.message);
        const { data } = supabase.storage.from('item-images').getPublicUrl(path);
        return data.publicUrl;
    };

    const onSubmit = async (values) => {
        setSubmitState('loading'); setErrorMsg('');
        try {
            let image_url = null;
            if (imageFile) image_url = await uploadImage(imageFile);
            const { error } = await supabase.from('donation_items').insert({
                name: values.name, category: values.category,
                description: values.description ?? '', pincode: values.pincode,
                location: values.location, donor_name: values.donor_name,
                whatsapp_number: values.whatsapp_number,
                image_url, status: 'available',
                user_id: user.id,
            });
            setAfterPostData({
                name: values.name, category: values.category,
                description: values.description ?? '', pincode: values.pincode,
                location: values.location, donor_name: values.donor_name,
                whatsapp_number: values.whatsapp_number,
                image_url, status: 'available',
                user_id: user.id,
            });
            if (error) throw new Error(error.message);
            setSubmitState('success'); reset(); removeImage();
            setConfirmOpen(true);

            // setTimeout(() => navigate('/'), 1500);
        } catch (err) {
            setSubmitState('error');
            setErrorMsg(err.message ?? 'Something went wrong. Please try again.');
        }
    };

    return (
        <div className="mx-auto max-w-3xl px-4 pt-5 pb-28 lg:pb-10">
            <ShareDonationModal
                open={confirmOpen}
                onClose={() => { setConfirmOpen(false); navigate('/'); setAfterPostData(null); }}
                itemName={afterpostdata?.name}
                category={afterpostdata?.category}
                pincode={afterpostdata?.pincode}
                whatsapp={afterpostdata?.whatsapp_number}
            />
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground">Daan Karo 🎁</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Give something you no longer need — make someone's day!</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{ background: 'rgba(19,136,8,0.1)', color: '#138808' }}>
                    ✅ Logged in as {user.email}
                </div>
            </motion.div>

            <form className="mt-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-5 lg:space-y-0">

                    {/* Photo */}
                    <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1, duration: 0.35 }}>
                        <label className="text-sm font-bold text-foreground">Photo</label>
                        <div className="mt-1.5 relative flex lg:min-h-[360px] h-48 items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}>
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                                    <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                        className="absolute top-2 right-2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70">
                                        <X className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center px-4">
                                    <Camera className="mx-auto h-10 w-10 text-muted-foreground" />
                                    <p className="mt-2 text-sm font-semibold text-muted-foreground">Tap to add photo</p>
                                    <p className="text-xs text-muted-foreground opacity-70 mt-0.5">Max 5 MB · JPG, PNG, WEBP</p>
                                </div>
                            )}
                            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                        </div>
                    </motion.div>

                    {/* Fields */}
                    <div className="space-y-4">
                        {[
                            { i: 1, label: 'Your Name *', name: 'donor_name', type: 'text', placeholder: 'e.g. Rahul Sharma' },
                            { i: 2, label: 'Item Name *', name: 'name', type: 'text', placeholder: 'e.g. Wooden Study Table' },
                        ].map(({ i, label, name, type, placeholder }) => (
                            <motion.div key={name} custom={i} variants={fieldVariants} initial="hidden" animate="show">
                                <label className="text-sm font-bold text-foreground">{label}</label>
                                <input type={type} placeholder={placeholder} {...register(name)}
                                    className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring transition-shadow" />
                                <FieldError msg={(errors)[name]?.message} />
                            </motion.div>
                        ))}

                        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">Category *</label>
                            <select {...register('category')}
                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
                                <option value="">Category chuno...</option>
                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                            <FieldError msg={errors.category?.message} />
                        </motion.div>

                        <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">Description</label>
                            <textarea rows={3} placeholder="Item ke baare mein thoda batao..." {...register('description')}
                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none" />
                        </motion.div>

                        <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">Pincode *</label>
                            <input type="text" inputMode="numeric" placeholder="e.g. 734001" maxLength={6} {...register('pincode')}
                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring" />
                            <FieldError msg={errors.pincode?.message} />
                        </motion.div>

                        <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">Pickup Location *</label>
                            <textarea placeholder="e.g. Salt Lake, Kolkata, West Bengal" {...register('location')}
                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none" />
                            <FieldError msg={errors.location?.message} />
                        </motion.div>

                        <motion.div custom={7} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">WhatsApp Number *</label>
                            <div className="mt-1.5 flex items-center rounded-xl border border-input bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                <span className="px-3 py-2.5 text-sm text-muted-foreground border-r border-input select-none bg-muted/30">+91</span>
                                <input type="tel" inputMode="numeric" placeholder="9876543210" maxLength={10} {...register('whatsapp_number')}
                                    className="flex-1 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent" />
                            </div>
                            <FieldError msg={errors.whatsapp_number?.message} />
                        </motion.div>
                    </div>
                </div>

                <AnimatePresence>
                    {submitState === 'error' && (
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/15 border border-destructive/30 px-4 py-3">
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                            <p className="text-sm text-destructive font-medium">{errorMsg}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.button type="submit"
                    disabled={submitState === 'loading' || submitState === 'success'}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }} whileTap={{ scale: 0.97 }}
                    className="mt-6 w-full lg:w-auto lg:px-14 rounded-xl py-3.5 text-sm font-bold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                    {submitState === 'loading' && <><Loader2 className="h-4 w-4 animate-spin" />Posting...</>}
                    {submitState === 'success' && <><CheckCircle2 className="h-4 w-4" />Posted! Redirecting...</>}
                    {(submitState === 'idle' || submitState === 'error') && <>🎁 Post Item — Daan Karo!</>}
                </motion.button>
            </form>
        </div>
    );
}

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
