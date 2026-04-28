import { useState } from 'react';
import { X } from 'lucide-react';

const GOOGLE_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJ_4mQQL57HToRwPcx1mhKT0Q'; // 🔁 Replace with your Google Place review URL

const ANDROID_STEPS = [
    { title: 'Open Chrome Browser', desc: 'Visit daanguru.in in Chrome (not Samsung or Firefox browser)' },
    { title: 'Tap the 3-dot Menu ⋮', desc: 'Top right corner of Chrome → tap three vertical dots' },
    { title: 'Tap "Add to Home screen"', desc: 'Scroll down in the menu and tap "Add to Home screen"' },
    { title: 'Tap "Add" to confirm', desc: 'DaanGuru icon will appear on your home screen like an app! 🎉' },
];

const IOS_STEPS = [
    { title: 'Open Safari Browser', desc: 'Visit daanguru.in in Safari (must be Safari, not Chrome)' },
    { title: 'Tap the Share Button', desc: 'Bottom center of Safari → tap the square with arrow pointing up ↑' },
    { title: 'Tap "Add to Home Screen"', desc: 'Scroll down in share sheet → tap "Add to Home Screen"' },
    { title: 'Tap "Add" to confirm', desc: 'DaanGuru icon appears on your iPhone home screen! 🎉' },
];

function Step({ number, title, desc }) {
    return (
        <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/[0.04] border border-white/[0.07] mb-2 hover:bg-[#1D9E75]/10 hover:border-[#8EF0CC]/20 transition-all">
            <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-[#1D9E75]/25 border border-[#1D9E75]/50 text-[#8EF0CC] text-xs font-bold">
                {number}
            </div>
            <div>
                <p className="text-sm font-semibold text-white mb-0.5">{title}</p>
                <p className="text-xs text-white/55 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}

export default function HomeScreenModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('install');
    const [activeOS, setActiveOS] = useState('android');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-3xl overflow-hidden border border-[#8EF0CC]/18"
                style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)' }}>

                {/* Header */}
                <div className="flex items-start justify-between p-5 pb-4 border-b border-[#8EF0CC]/12"
                    style={{ background: 'linear-gradient(135deg, rgba(29,158,117,0.25), rgba(29,158,117,0.08))' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                            style={{ background: 'linear-gradient(135deg, #1D9E75, #0f6e56)' }}>
                            🙏
                        </div>
                        <div>
                            <p className="text-white font-bold text-base leading-none">DaanGuru</p>
                            <p className="text-[#8EF0CC]/70 text-xs mt-1">daanguru.in</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-7 h-7 rounded-full flex items-center justify-center bg-white/8 border border-white/12 text-white/60 hover:text-white hover:bg-white/14 transition-all"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-[#8EF0CC]/10 bg-black/10">
                    {[
                        { id: 'install', label: '📲 Add to Home' },
                        { id: 'review', label: '⭐ Review Us' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-3 text-xs font-semibold transition-all border-b-2 ${activeTab === tab.id
                                ? 'text-[#8EF0CC] border-[#1D9E75] bg-[#1D9E75]/8'
                                : 'text-white/45 border-transparent hover:text-white/70'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Install Tab */}
                {activeTab === 'install' && (
                    <div className="p-5">
                        <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <span>📱</span> Install DaanGuru on your phone
                        </p>

                        {/* OS Toggle */}
                        <div className="flex gap-2 mb-4">
                            {[
                                { id: 'android', label: '🤖 Android' },
                                { id: 'ios', label: '🍎 iPhone' },
                            ].map((os) => (
                                <button
                                    key={os.id}
                                    onClick={() => setActiveOS(os.id)}
                                    className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${activeOS === os.id
                                        ? 'bg-[#1D9E75]/20 border-[#1D9E75]/50 text-[#8EF0CC]'
                                        : 'bg-white/5 border-white/10 text-white/55'
                                        }`}
                                >
                                    {os.label}
                                </button>
                            ))}
                        </div>

                        {/* Steps */}
                        {(activeOS === 'android' ? ANDROID_STEPS : IOS_STEPS).map((step, i) => (
                            <Step key={i} number={i + 1} title={step.title} desc={step.desc} />
                        ))}

                        <button
                            onClick={onClose}
                            className="w-full mt-4 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:-translate-y-0.5"
                            style={{
                                background: 'linear-gradient(135deg, #1D9E75, #0f6e56)',
                                boxShadow: '0 4px 20px rgba(29,158,117,0.3)',
                            }}
                        >
                            Theek Hai, Samajh Gaya! ✅
                        </button>
                    </div>
                )}

                {/* Review Tab */}
                {activeTab === 'review' && (
                    <div className="p-5">
                        <p className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                            <span>🙏</span> Aapka review bahut zaroori hai!
                        </p>

                        <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-3">
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0 bg-red-500/15 border border-red-500/25">
                                ⭐
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-yellow-400 text-sm mb-0.5">★★★★★</p>
                                <p className="text-sm font-semibold text-white">Review on Google</p>
                                <p className="text-xs text-white/50">Help others find DaanGuru — 2 minutes, big impact</p>
                            </div>
                            <a
                                href={GOOGLE_REVIEW_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-500/20 border border-red-500/35 text-red-300 hover:bg-red-500/35 transition-all whitespace-nowrap"
                            >
                                Review
                            </a>
                        </div>

                        <div className="p-3 rounded-xl bg-[#1D9E75]/12 border border-[#1D9E75]/25 flex gap-2 text-xs text-[#8EF0CC]/85 leading-relaxed">
                            <span>💬</span>
                            <span>Aapke ek review se hum aur logon tak pahunch sakte hain jo blood donors dhundh rahe hain ya donation dena chahte hain. Dil se shukriya! 🙏</span>
                        </div>

                        <a
                            href={GOOGLE_REVIEW_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-full mt-4 py-3.5 rounded-2xl text-sm font-bold text-white transition-all hover:-translate-y-0.5 no-underline"
                            style={{
                                background: 'linear-gradient(135deg, #1D9E75, #0f6e56)',
                                boxShadow: '0 4px 20px rgba(29,158,117,0.3)',
                            }}
                        >
                            Google par Review Karo ⭐
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
