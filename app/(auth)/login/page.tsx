'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('E-Mail oder Passwort ist falsch.');
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-card rounded-2xl p-8 shadow-2xl">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Image
            src="/logo_imperoyal.png"
            alt="Imperoyal Immobilien"
            width={200}
            height={60}
            className="h-16 w-auto mx-auto mb-4"
            priority
          />
          <p className="text-slate-600 mt-1">
            Optimierungsprotokoll-System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              placeholder="name@beispiel.de"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass-input w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? 'Anmelden...' : 'Anmelden'}
          </button>
        </form>

        {/* Admin Quick Login (Development) */}
        <div className="mt-4">
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setError(null);
              const supabase = createClient();
              const { error } = await supabase.auth.signInWithPassword({
                email: 'admin@imperoyal.de',
                password: 'admin123',
              });
              if (error) {
                setError('Admin-Login fehlgeschlagen. Bitte Admin-Account erstellen.');
                setLoading(false);
                return;
              }
              router.push('/dashboard');
              router.refresh();
            }}
            disabled={loading}
            className="w-full bg-slate-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 transition-all"
          >
            {loading ? 'Anmelden...' : 'Admin Login (Demo)'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="/reset-password"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Passwort vergessen?
          </a>
        </div>
      </div>
    </div>
  );
}
