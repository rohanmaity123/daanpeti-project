import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { supabase } from '../../utils/supabaseClient';
import { useNavigate } from 'react-router-dom';
/* ─── Zod schema ─── */
const schema = z.object({
    name: z.string().min(3, 'Item name must be at least 3 characters'),
    category: z.string().min(1, 'Please select a category'),
    description: z.string().optional(),
    pincode: z
        .string()
        .length(6, 'Pincode must be exactly 6 digits')
        .regex(/^\d+$/, 'Pincode must be numeric'),
    location: z.string().min(2, 'Please provide a more specific location'),
    whatsapp_number: z
        .string()
        .min(10, 'Enter a valid 10-digit number')
        .max(13, 'Number too long')
        .regex(/^\d+$/, 'Only digits allowed'),
    donor_name: z.string().min(2, 'Enter your name'),
});


const categories = [
    { value: 'clothes', label: '👕 Kapde / Clothes' },
    { value: 'furniture', label: '🪑 Furniture' },
    { value: 'books', label: '📚 Kitaabein / Books' },
    { value: 'electronics', label: '📱 Electronics' },
    { value: 'toys', label: '🧸 Khilone / Toys' },
    { value: 'other', label: '📦 Other' },
];

const fieldVariants = {
    hidden: { opacity: 0, y: 14 },
    show: (i) => ({
        opacity: 1, y: 0,
        transition: { delay: 0.07 * i, duration: 0.28, ease: 'easeOut' },
    }),
};

/* ─── Component ─── */
export default function PostItemPage() {
    const navigate = useNavigate();
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [submitState, setSubmitState] = useState('idle');
    const [errorMsg, setErrorMsg] = useState('');
    const fileInputRef = useRef(null);

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm({
        resolver: zodResolver(schema),
    });

    /* Image picker */
    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setErrorMsg('Image must be under 5 MB');
            return;
        }
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    /* Upload image to Supabase Storage */
    const uploadImage = async (file) => {
        const ext = file.name.split('.').pop();
        const path = `items/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

        const { error } = await supabase.storage
            .from('item-images')   // ← your bucket name
            .upload(path, file, { cacheControl: '3600', upsert: false });

        if (error) throw new Error(error.message);

        const { data } = supabase.storage.from('item-images').getPublicUrl(path);
        return data.publicUrl;
    };

    /* Form submit */
    const onSubmit = async (values) => {
        setSubmitState('loading');
        setErrorMsg('');

        try {
            let image_url = null;

            if (imageFile) {
                image_url = await uploadImage(imageFile);
            }

            const { error } = await supabase.from('donation_items').insert({
                name: values.name,
                category: values.category,
                description: values.description ?? '',
                pincode: values.pincode,
                location: values.location,   // you can resolve to city later
                donor_name: values.donor_name,
                whatsapp_number: values.whatsapp_number,
                image_url,
                status: 'available',
            });

            if (error) throw new Error(error.message);

            setSubmitState('success');
            reset();
            removeImage();

            // Redirect to home after 2 s
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setSubmitState('error');
            setErrorMsg(err.message ?? 'Something went wrong. Please try again.');
        }
    };

    /* ─── Render ─── */
    return (
        <div className="mx-auto max-w-3xl px-4 pt-4 pb-24 lg:pb-8">
            {/* Heading */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <h1 className="text-xl font-extrabold text-foreground">Daan Karo 🎁</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                    Give something you no longer need — make someone's day!
                </p>
            </motion.div>

            <form className="mt-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div className="lg:grid lg:grid-cols-2 lg:gap-8 space-y-4 lg:space-y-0">

                    {/* ── Left: Photo upload ── */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1, duration: 0.35 }}
                    >
                        <label className="text-sm font-bold text-foreground">Photo</label>
                        <div
                            className="mt-1.5 relative flex lg:min-h-[320px] h-44 items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors overflow-hidden"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="preview" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                        className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white hover:bg-black/70 transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                <div className="text-center">
                                    <Camera className="mx-auto h-8 w-8 text-muted-foreground" />
                                    <p className="mt-1 text-xs text-muted-foreground font-medium">Tap to add photo</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">Max 5 MB</p>
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
                    </motion.div>

                    {/* ── Right: Fields ── */}
                    <div className="space-y-4">

                        {/* Donor Name */}
                        <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">Your Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Rahul Sharma"
                                {...register('donor_name')}
                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                            />
                            <FieldError msg={errors.donor_name?.message} />
                        </motion.div>

                        {/* Item Name */}
                        <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">Item Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Wooden Study Table"
                                {...register('name')}
                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                            />
                            <FieldError msg={errors.name?.message} />
                        </motion.div>

                        {/* Category */}
                        <motion.div custom={3} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">Category *</label>
                            <select
                                {...register('category')}
                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="">Category chuno...</option>
                                {categories.map((cat) => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                            <FieldError msg={errors.category?.message} />
                        </motion.div>

                        {/* Description */}
                        <motion.div custom={4} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">Description</label>
                            <textarea
                                rows={3}
                                placeholder="Item ke baare mein thoda batao..."
                                {...register('description')}
                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring resize-none"
                            />
                        </motion.div>

                        {/* Pincode */}
                        <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">Pincode *</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                placeholder="e.g. 400058"
                                maxLength={6}
                                {...register('pincode')}
                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                            />
                            <FieldError msg={errors.pincode?.message} />
                        </motion.div>
                        {/* Location */}
                        <motion.div custom={5} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">Pickup Location *</label>
                            <textarea
                                type="text"
                                placeholder="e.g. Salt Lake,kolkata, west bengal"
                                {...register('location')}
                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"
                            />
                            <FieldError msg={errors.location?.message} />
                        </motion.div>
                        {/* WhatsApp */}
                        <motion.div custom={6} variants={fieldVariants} initial="hidden" animate="show">
                            <label className="text-sm font-bold text-foreground">WhatsApp Number *</label>
                            <div className="mt-1.5 flex items-center rounded-xl border border-input bg-card overflow-hidden focus-within:ring-2 focus-within:ring-ring">
                                <span className="px-3 py-2.5 text-sm text-muted-foreground border-r border-input select-none">+91</span>
                                <input
                                    type="tel"
                                    inputMode="numeric"
                                    placeholder="9876543210"
                                    maxLength={10}
                                    {...register('whatsapp_number')}
                                    className="flex-1 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none bg-transparent"
                                />
                            </div>
                            <FieldError msg={errors.whatsapp_number?.message} />
                        </motion.div>
                    </div>
                </div>

                {/* API error banner */}
                <AnimatePresence>
                    {submitState === 'error' && (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            className="mt-4 flex items-start gap-2 rounded-xl bg-destructive/15 border border-destructive/30 px-4 py-3"
                        >
                            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                            <p className="text-sm text-destructive font-medium">{errorMsg}</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit button */}
                <motion.button
                    type="submit"
                    disabled={submitState === 'loading' || submitState === 'success'}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.3 }}
                    whileTap={{ scale: submitState === 'idle' || submitState === 'error' ? 0.97 : 1 }}
                    className="mt-6 w-full lg:w-auto lg:px-12 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {submitState === 'loading' && (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Posting...</>
                    )}
                    {submitState === 'success' && (
                        <><CheckCircle2 className="h-4 w-4" /> Posted! Redirecting...</>
                    )}
                    {(submitState === 'idle' || submitState === 'error') && (
                        <>🎁 Post Item — Daan Karo!</>
                    )}
                </motion.button>
            </form>
        </div>
    );
}

/* ─── Inline field error ─── */
function FieldError({ msg }) {
    return (
        <AnimatePresence>
            {msg && (
                <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 text-xs text-destructive font-medium flex items-center gap-1"
                >
                    <AlertCircle className="h-3 w-3 shrink-0" />
                    {msg}
                </motion.p>
            )}
        </AnimatePresence>
    );
}
