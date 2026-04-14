import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Page404() {
  const navigator = useNavigate();
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* 404 Illustration */}
        <div className="relative">
          <div className="text-8xl font-black text-primary/20">404</div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-16 w-16 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold text-foreground">
            Oops! Page nahi mili 😔
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Lagta hai aap galat jagah aa gaye ho. Yeh page exist nahi karti.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <Home className="h-4 w-4" />
            Home Jaayein
          </Link>
          <button
            onClick={() => navigator('/')}
            className="flex items-center justify-center gap-2 rounded-xl border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back Jaayein
          </button>
        </div>

        {/* Additional Help */}
        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Agar yeh galti lagti hai, toh humse contact karein
          </p>
        </div>
      </div>
    </div>
  );
}
