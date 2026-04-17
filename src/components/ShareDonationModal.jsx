import { useState, useRef } from 'react';
import { X, Download, Share2 } from 'lucide-react';

const platformColors = {
    instagram: 'from-pink-500 via-purple-500 to-orange-400',
    facebook: 'from-blue-600 to-blue-400',
    twitter: 'from-sky-400 to-sky-600',
    linkedin: 'from-blue-700 to-cyan-500',
};

const platformLabels = {
    instagram: '📸 Instagram',
    facebook: '👍 Facebook',
    twitter: '🐦 Twitter / X',
    linkedin: '💼 LinkedIn',
};

export default function ShareDonationModal({
    open,
    onClose,
    itemName,
    category,
    pincode,
    whatsapp,
}) {
    const [selectedPlatform, setSelectedPlatform] = useState('instagram');
    const cardRef = useRef(null);

    if (!open) return null;

    const categoryEmoji = {
        clothes: '👕',
        furniture: '🪑',
        books: '📚',
        electronics: '📱',
        toys: '🧸',
        other: '📦',
    };

    const emoji = categoryEmoji[category] || '🎁';

    const today = new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    const shareText = `🎁 Hey! Today I donated "${itemName}" on DaanGuru!\n\nIf you need it, claim it for FREE!\n📍 Pincode: ${pincode}\n📱 WhatsApp: ${whatsapp}\n\n#DaanGuru #FreeStuff #Donate #GiveBack`;

    const shareUrl = 'https://daanguru.netlify.app';

    function handleShare(platform) {
        const text = encodeURIComponent(shareText);
        const url = encodeURIComponent(shareUrl);

        const links = {
            twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            instagram: '',
        };

        if (platform === 'instagram') {
            alert('Screenshot this card and share it on your Instagram Story or Post! 📸');
            return;
        }

        const link = links[platform];
        if (link) window.open(link, '_blank', 'noopener,noreferrer');
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-5 pt-5 pb-2">
                    <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                        <Share2 className="h-5 w-5" /> Share Your Daan
                    </h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1.5 hover:bg-muted transition-colors"
                    >
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Platform Tabs */}
                <div className="flex gap-2 px-5 py-3 overflow-x-auto">
                    {Object.keys(platformLabels).map((p) => (
                        <button
                            key={p}
                            onClick={() => setSelectedPlatform(p)}
                            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${selectedPlatform === p
                                    ? 'bg-primary text-primary-foreground shadow-md scale-105'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                }`}
                        >
                            {platformLabels[p]}
                        </button>
                    ))}
                </div>

                {/* Share Card Preview */}
                <div className="px-5 pb-4">
                    <div
                        ref={cardRef}
                        className={`relative rounded-2xl bg-gradient-to-br ${platformColors[selectedPlatform]} p-6 text-white overflow-hidden`}
                    >
                        {/* Decorative circles */}
                        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-white/10" />
                        <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/10" />

                        {/* Branding */}
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">🎁</span>
                                <span className="font-extrabold text-lg tracking-tight">DaanGuru</span>
                            </div>

                            <p className="text-sm font-medium opacity-90">Hey! Today I donated</p>

                            <div className="mt-2 flex items-center gap-3">
                                <span className="text-4xl">{emoji}</span>
                                <div>
                                    <h3 className="text-xl font-extrabold leading-tight">
                                        {itemName || 'My Item'}
                                    </h3>
                                    <p className="text-xs opacity-80 mt-0.5">{today}</p>
                                </div>
                            </div>

                            <div className="mt-4 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-3">
                                <p className="text-sm font-bold">Want this? Claim it for FREE!</p>
                                <div className="mt-1.5 flex flex-col gap-0.5 text-xs opacity-90">
                                    <span>📍 Pincode: {pincode || '------'}</span>
                                    <span>📱 WhatsApp: {whatsapp || '----------'}</span>
                                </div>
                            </div>

                            <p className="mt-3 text-[10px] opacity-60 text-center">
                                #DaanGuru #FreeStuff #GiveBack #Donate
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 px-5 pb-5">
                    <button
                        onClick={() => handleShare(selectedPlatform)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
                    >
                        <Share2 className="h-4 w-4" />
                        Share on {platformLabels[selectedPlatform]}
                    </button>
                </div>

            </div>
        </div>
    );
}