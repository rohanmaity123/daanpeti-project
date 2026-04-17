import { useEffect, useState } from 'react';
import { Mail, MessageCircle, MapPin, HelpCircle, ChevronDown, ChevronUp, Send, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../utils/supabaseClient';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const contactCards = [
    {
        emoji: '📧', icon: Mail, title: 'General Queries',
        value: 'hello@DaanGuru.in', sub: 'We reply within 24 hours',
        color: '#138808', bg: 'rgba(19,136,8,0.1)',
    },
    {
        emoji: '🛟', icon: HelpCircle, title: 'Report a Problem',
        value: 'support@DaanGuru.in', sub: 'For item disputes or account issues',
        color: '#FF9933', bg: 'rgba(255,153,51,0.1)',
    },
    {
        emoji: '💬', icon: MessageCircle, title: 'WhatsApp Us',
        value: '+91 98765 43210', sub: 'Mon–Sat, 10am–6pm IST',
        color: '#25D366', bg: 'rgba(37,211,102,0.1)',
        whatsapp: 'https://wa.me/919876543210',
    },
    {
        emoji: '📍', icon: MapPin, title: 'Based In',
        value: 'Siliguri, West Bengal', sub: 'Serving all of India 🇮🇳',
        color: '#0066CC', bg: 'rgba(0,102,204,0.1)',
    },
];

const faqs = [
    {
        q: 'Is DaanGuru really 100% free?',
        a: 'Yes! DaanGuru is completely free for everyone — donors and recipients. There are no hidden charges, no subscriptions, and no transaction fees. Ever. We run on voluntary community support.',
    },
    {
        q: 'How do I contact a donor?',
        a: 'Click on any item and tap the WhatsApp button. You will be connected directly with the donor. DaanGuru does not act as a middleman — it is a direct connection between neighbours.',
    },
    {
        q: 'Can I donate anything?',
        a: 'You can donate any legal, usable item — clothes, furniture, books, electronics, kitchenware, toys, and more. No food, medicines, animals, alcohol, weapons, or illegal items please.',
    },
    {
        q: 'Is my phone number safe?',
        a: 'Your WhatsApp number is only visible when you choose to post an item. You are in full control. We never share your number with third parties.',
    },
    {
        q: 'How do I delete my account?',
        a: 'Email us at privacy@DaanGuru.in with your registered email and we will delete your account and all associated data within 7 business days.',
    },
    {
        q: 'Can NGOs use DaanGuru?',
        a: 'Absolutely! NGOs and charitable organisations are welcome. You can post requests for items your organisation needs, or donate surplus items. Contact us at hello@DaanGuru.in for a verified NGO badge.',
    },
];

const subjects = [
    'General Query', 'Report an Item', 'Partnership / NGO',
    'Technical Issue', 'Press / Media', 'Other',
];

function FAQItem({ faq }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="glass-card overflow-hidden">
            <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-3 p-4 text-left">
                <span className="text-sm font-bold text-foreground">{faq.q}</span>
                {open ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
            </button>
            {open && (
                <div className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
            )}
        </div>
    );
}

export default function Contact() {
    const [mounted, setMounted] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => { setMounted(true); }, []);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm();

    const onSubmit = async (data) => {
        const { error } = await supabase.from('contact_messages').insert({
            name: data.name.trim(),
            email: data.email.trim().toLowerCase(),
            subject: data.subject,
            message: data.message.trim(),
        });

        if (error) {
            toast.error(error.message || 'Kuch toh gadbad hai. Please try again later.');
        } else {
            reset()
            setSubmitted(true);
        }
    };

    return (
        <div className="mx-auto max-w-5xl px-4 lg:px-6 pt-6 pb-28 lg:pb-12">

            <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-6">
                ← Back to Home
            </Link>

            {/* Header */}
            <div className={`glass-card p-6 lg:p-8 mb-6 relative overflow-hidden ${mounted ? 'animate-fade-up' : 'opacity-0'}`}>
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
                <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground">Humse Milein 🙏</h1>
                <p className="mt-1 text-sm text-muted-foreground">We're a small team but we care a lot. Reach out anytime.</p>
            </div>

            {/* Contact cards grid */}
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 ${mounted ? 'animate-fade-up delay-100' : 'opacity-0'}`}>
                {contactCards.map((card, i) => (
                    <div key={i} className="glass-card p-5" style={{ animationDelay: `${100 + i * 60}ms` }}>
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center mb-3" style={{ background: card.bg }}>
                            <card.icon className="h-5 w-5" style={{ color: card.color }} />
                        </div>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1">{card.title}</p>
                        <p className="text-sm font-extrabold text-foreground">{card.value}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
                        {card.whatsapp && (
                            <a href={card.whatsapp} target="_blank" rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-90"
                                style={{ background: 'rgba(37,211,102,0.85)' }}>
                                <MessageCircle className="h-3 w-3" /> Chat on WhatsApp
                            </a>
                        )}
                    </div>
                ))}
            </div>

            {/* Form + FAQ side by side on desktop */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-6 lg:space-y-0">

                {/* Contact Form */}
                <div className={`glass-card p-6 ${mounted ? 'animate-fade-up delay-200' : 'opacity-0'}`}>
                    <h2 className="text-lg font-extrabold text-foreground mb-1">Humse Baat Karo 💬</h2>
                    <p className="text-xs text-muted-foreground mb-5">Got a question or suggestion? Write to us!</p>

                    {submitted ? (
                        <div className="text-center py-8 animate-scale-in">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3" style={{ color: '#138808' }} />
                            <h3 className="text-base font-extrabold text-foreground">Shukriya! 🙏</h3>
                            <p className="mt-1 text-sm text-muted-foreground">We'll get back to you within 24 hours.</p>
                            <button onClick={() => setSubmitted(false)} className="mt-4 text-xs font-semibold hover:underline" style={{ color: '#138808' }}>
                                Send another message
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            {[
                                { label: 'Your Name', name: 'name', type: 'text', placeholder: 'e.g. Priya Sharma', required: true },
                                { label: 'Email Address', name: 'email', type: 'email', placeholder: 'you@example.com', required: true },
                            ].map((f) => (
                                <div key={f.label}>
                                    <label className="text-xs font-bold text-foreground block mb-1.5">{f.label}</label>

                                    <input
                                        type={f.type}
                                        placeholder={f.placeholder}
                                        {...register(f.name, { required: f.required })}
                                        className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
                                    />

                                    {errors[f.name] && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {f.label} is required
                                        </p>
                                    )}
                                </div>
                            ))}
                            <div>
                                <label className="text-xs font-bold text-foreground block mb-1.5">Subject</label>
                                <select
                                    {...register("subject", { required: true })}
                                    className="w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm"
                                >
                                    <option value="">Select a subject...</option>
                                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>

                                {errors.subject && (
                                    <p className="text-red-500 text-xs mt-1">Subject is required</p>
                                )}
                            </div>
                            <div>
                                <label className="text-xs font-bold text-foreground block mb-1.5">Message</label>
                                <textarea
                                    rows={5}
                                    placeholder="Apna sawaal ya sujhaav likhein..."
                                    {...register("message", { required: true })}
                                    className="w-full rounded-xl border border-input px-3.5 py-2.5 text-sm"
                                ></textarea>

                                {errors.message && (
                                    <p className="text-red-500 text-xs mt-1">Message is required</p>
                                )}
                            </div>
                            <button type="submit"
                                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white hover:opacity-90 active:scale-95 transition-all"
                                style={{ background: 'linear-gradient(135deg,#138808,#1D9E75)' }}>
                                <Send className="h-4 w-4" />
                                Bhejo! Send Message 📨
                            </button>
                        </form>
                    )}
                </div>

                {/* FAQ */}
                <div className={mounted ? 'animate-fade-up delay-300' : 'opacity-0'}>
                    <h2 className="text-lg font-extrabold text-foreground mb-4">Aksar Puche Jaane Wale Sawaal ❓</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => <FAQItem key={i} faq={faq} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}
