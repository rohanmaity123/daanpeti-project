import { Heart, LogIn } from 'lucide-react';
import { useState } from 'react';
import { LogOut, Edit3, Save, Calendar, Activity, Star, Mail, User } from 'lucide-react';
import { Avatar, Button, Input, TextareaAutosize } from '@mui/material';



const MOCK_USER = {
    name: 'Ananya Sharma',
    email: 'ananya.sharma@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face',
    joinedDate: 'Jan 2025',
    itemsDonated: 12,
    itemsReceived: 3,
};

const MOCK_REVIEWS = [
    { id: 1, name: 'Rahul K.', text: 'Ananya donated a beautiful bookshelf. Very kind!', rating: 5 },
    { id: 2, name: 'Priya M.', text: 'Quick response and item was in great condition.', rating: 4 },
    { id: 3, name: 'Vikram S.', text: 'Smooth pickup, very generous person 🙏', rating: 5 },
];

const NotLoginProfilePage = () => {
    return (


        <div className="mt-12 flex flex-col items-center text-center">
            <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center">
                <Heart className="h-10 w-10 text-primary" />
            </div>
            <p className="mt-4 text-base font-bold text-foreground">
                DaanPeti mein aapka swagat hai! 🙏
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
                Login karein aur daan karna shuru karein
            </p>
            <button
                className="mt-6 flex items-center gap-2 rounded-xl bg-foreground px-6 py-3 text-sm font-bold text-background hover:opacity-90 transition-opacity"
            >
                <LogIn className="h-4 w-4" />
                Sign in with Google
            </button>
            <p className="mt-3 text-xs text-muted-foreground">
                Sirf Google login supported hai
            </p>
        </div>
    );
}

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [username, setUsername] = useState('ananya_sharma');
    const [bio, setBio] = useState('Believer in sharing. Minimalist at heart. Mumbai 🌿');
    const [tempUsername, setTempUsername] = useState(username);
    const [tempBio, setTempBio] = useState(bio);

    const handleEdit = () => {
        setTempUsername(username);
        setTempBio(bio);
        setIsEditing(true);
    };

    const handleSave = () => {
        setUsername(tempUsername);
        setBio(tempBio);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    return (
        <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
            <h1 className="text-xl font-extrabold text-foreground">Profile 👤</h1>
            <div className="min-h-screen pb-24 lg:pb-8">
                <div className="mx-auto max-w-3xl px-4 pt-6 lg:pt-10">
                    {/* Welcome heading */}
                    <h1 className="text-2xl font-extrabold text-foreground lg:text-3xl">
                        Welcome back, {MOCK_USER.name.split(' ')[0]} 👋
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">Manage your DaanPeti profile</p>

                    {/* Profile Card - Glassmorphism */}
                    <div className="mt-6 rounded-2xl border p-6 shadow-xl backdrop-blur-xl lg:p-8">
                        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="rounded-full bg-gradient-to-br from-[#6366f1] via-[#a855f7] to-[#ec4899] p-[3px]">
                                    <Avatar className="h-24 w-24 border-2 border-white lg:h-28 lg:w-28" src={MOCK_USER.avatar} alt={MOCK_USER.name}>

                                        <p className="text-xl font-bold bg-primary text-primary-foreground">
                                            {MOCK_USER.name.split(' ').map(n => n[0]).join('')}
                                        </p>
                                    </Avatar>
                                </div>
                                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full border-2 border-white bg-green-500" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 text-center sm:text-left">
                                <h2 className="text-xl font-bold text-foreground lg:text-2xl">{MOCK_USER.name}</h2>
                                <div className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                                    <Mail className="h-3.5 w-3.5" />
                                    {MOCK_USER.email}
                                </div>

                                {/* Editable fields */}
                                <div className="mt-4 space-y-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Username
                                        </label>
                                        {isEditing ? (
                                            <input
                                                value={tempUsername}
                                                onChange={(e) => setTempUsername(e.target.value)}
                                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"

                                            />
                                        ) : (
                                            <div className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                                <User className="h-3.5 w-3.5 text-muted-foreground" />
                                                @{username}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Bio
                                        </label>
                                        {isEditing ? (
                                            <textarea
                                                value={tempBio}
                                                onChange={(e) => setTempBio(e.target.value)}
                                                rows={2}
                                                className="mt-1.5 w-full rounded-xl border border-input bg-card px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-ring"

                                            />
                                        ) : (
                                            <p className="text-sm text-muted-foreground">{bio}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Action buttons */}
                                <div className="mt-6 flex flex-wrap gap-3">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleSave}
                                                className="flex items-center justify-center gap-2 w-full lg:w-auto px-6 py-3 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
                                            >
                                                <Save className="h-4 w-4" />
                                                Save Changes
                                            </button>

                                            <button
                                                onClick={handleCancel}
                                                className="flex items-center justify-center gap-2 w-full lg:w-auto px-6 py-3 rounded-xl border border-white/40 text-white hover:bg-white/10 transition"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleEdit}
                                                className="flex items-center justify-center gap-2 w-full lg:w-auto px-6 py-3 rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:opacity-90 transition"
                                            >
                                                <Edit3 className="h-4 w-4" />
                                                Edit Profile
                                            </button>

                                            <button
                                                // onClick={handleLogout}
                                                className="flex items-center justify-center gap-2 w-full lg:w-auto px-6 py-3 rounded-xl border border-red-400/40 text-red-400 hover:bg-red-500/10 transition"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Logout
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mt-6 grid grid-cols-3 gap-3 lg:gap-4">
                        {[
                            { icon: Calendar, label: 'Joined', value: MOCK_USER.joinedDate, gradient: 'from-[#6366f1] to-[#818cf8]' },
                            { icon: Activity, label: 'Items Donated', value: MOCK_USER.itemsDonated, gradient: 'from-[#10b981] to-[#34d399]' },
                            { icon: Star, label: 'Items Received', value: MOCK_USER.itemsReceived, gradient: 'from-[#f59e0b] to-[#fbbf24]' },
                        ].map((stat) => (
                            <div
                                key={stat.label}
                                className="group rounded-2xl border p-4 text-center shadow-lg backdrop-blur-xl transition-all duration-300 hover:scale-[1.04] hover:shadow-xl"
                            >
                                <div className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} text-white shadow-md`}>
                                    <stat.icon className="h-5 w-5" />
                                </div>
                                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Reviews Section */}
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-foreground">Your Reviews ⭐</h3>
                        <div className="mt-3 space-y-3">
                            {MOCK_REVIEWS.map((review) => (
                                <div
                                    key={review.id}
                                    className="group rounded-2xl border p-4 shadow-lg backdrop-blur-xl transition-all duration-300 hover:shadow-xl"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-foreground">{review.name}</p>
                                        <div className="flex gap-0.5">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'text-muted-foreground/30'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="mt-1.5 text-sm text-muted-foreground">{review.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
