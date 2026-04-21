import { Helmet } from "react-helmet";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

const CityPage = ({ type }) => {
    const { city } = useParams();
    const [mounted, setMounted] = useState(false);

    const capitalizedCity = city
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    useEffect(() => {
        setMounted(true);
    }, []);

    const isFreePage = type === "free";
    const emoji = isFreePage ? "🎁" : "💝";
    const actionText = isFreePage ? "Browse Free Items" : "Start Donating";
    const description = isFreePage
        ? `Discover amazing free items in ${capitalizedCity}. Furniture, books, clothes, electronics, toys, and more – all free!`
        : `Make a difference in ${capitalizedCity}! Donate your unused items and help people in need. It's easy, free, and rewarding.`;

    return (
        <div className="min-h-screen  pt-20 pb-10 px-4 sm:px-6 lg:px-8">
            <Helmet>
                <title>
                    {isFreePage
                        ? `Free Items in ${capitalizedCity} | Daanguru`
                        : `Donate Items in ${capitalizedCity} | Daanguru`}
                </title>

                <meta
                    name="description"
                    content={description}
                />

                <meta
                    name="keywords"
                    content={isFreePage
                        ? `free items ${capitalizedCity}, free furniture, free books, donation platform`
                        : `donate items ${capitalizedCity}, donate clothes, charity platform, give away`}
                />
            </Helmet>

            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div
                    className={`text-center mb-8 sm:mb-12 ${mounted ? "animate-fade-up" : "opacity-0"
                        }`}
                >
                    <div className="text-6xl sm:text-7xl mb-4 drop-shadow-lg">
                        {emoji}
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                        {isFreePage ? "Free Items in" : "Donate Items in"}
                        <br />
                        <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            {capitalizedCity}
                        </span>
                    </h1>
                </div>

                {/* Main Card */}
                <div
                    className={`glass-card rounded-3xl p-6 sm:p-8 lg:p-12 mb-8 backdrop-blur-xl border border-white/10 ${mounted ? "animate-fade-up delay-100" : "opacity-0"
                        }`}
                >
                    <p className="text-lg sm:text-xl text-gray-100 leading-relaxed mb-6">
                        {description}
                    </p>

                    {isFreePage && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-8">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-3xl mb-2">🪑</div>
                                <p className="text-sm text-gray-300">Furniture</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-3xl mb-2">📚</div>
                                <p className="text-sm text-gray-300">Books</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-3xl mb-2">👕</div>
                                <p className="text-sm text-gray-300">Clothes</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-3xl mb-2">📱</div>
                                <p className="text-sm text-gray-300">Electronics</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-3xl mb-2">🧸</div>
                                <p className="text-sm text-gray-300">Toys</p>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <div className="text-3xl mb-2">📦</div>
                                <p className="text-sm text-gray-300">More</p>
                            </div>
                        </div>
                    )}

                    {!isFreePage && (
                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">✅</span>
                                <div>
                                    <h3 className="text-white font-semibold mb-1">Clean & Usable</h3>
                                    <p className="text-gray-300 text-sm">Donate items that are in good condition</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">🤝</span>
                                <div>
                                    <h3 className="text-white font-semibold mb-1">Help Others</h3>
                                    <p className="text-gray-300 text-sm">Make a real difference in someone's life</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⭐</span>
                                <div>
                                    <h3 className="text-white font-semibold mb-1">Earn Rewards</h3>
                                    <p className="text-gray-300 text-sm">Get points for every donation you make</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div
                    className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${mounted ? "animate-fade-up delay-150" : "opacity-0"
                        }`}
                >
                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-2 rounded-2xl px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-900 bg-white hover:bg-gray-100 transition-all duration-300 active:scale-95"
                    >
                        <span>← </span>
                        Back to Home
                    </Link>
                    <Link
                        to="/"
                        className="w-full flex items-center justify-center gap-2 rounded-2xl px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white transition-all duration-300 active:scale-95"
                        style={{
                            background: "linear-gradient(135deg, #138808, #1D9E75)",
                        }}
                    >
                        {actionText}
                        <span>→</span>
                    </Link>
                </div>

                {/* Info Text */}
                <div className={`text-center mt-12 ${mounted ? "animate-fade-up delay-200" : "opacity-0"}`}>
                    <p className="text-gray-400 text-sm sm:text-base">
                        Join thousands of people making a difference in {capitalizedCity}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CityPage;