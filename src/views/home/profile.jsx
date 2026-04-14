import { Heart, LogIn } from 'lucide-react';

export default function ProfilePage() {
    return (
        <div className="mx-auto max-w-lg px-4 pt-4 pb-24">
            <h1 className="text-xl font-extrabold text-foreground">Profile 👤</h1>

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
        </div>
    );
}
