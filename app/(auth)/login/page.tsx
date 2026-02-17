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
    <div className="w-full max-w-sm">
      <div className="bg-[#1E2A3A] rounded-2xl p-7 sm:p-8" style={{boxShadow: '0 8px 32px rgba(0,0,0,0.50), 0 1px 4px rgba(0,0,0,0.30)', border: '1px solid rgba(255,255,255,0.07)'}}>
        {/* Logo & Title */}
        <div className="text-center mb-7">
          <Image
            src="/logo_imperoyal.png"
            alt="Imperoyal Immobilien"
            width={160}
            height={44}
            className="h-12 w-auto mx-auto mb-3 brightness-0 invert"
            priority
          />
          <p className="text-[13px] text-[#9EAFC0]">
            Optimierungsprotokoll-System
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-[13px] font-medium text-[#EDF1F5] mb-1.5"
            >
              E-Mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px] text-[#EDF1F5]"
              placeholder="name@beispiel.de"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[13px] font-medium text-[#EDF1F5] mb-1.5"
            >
              Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-[10px] text-[14px]"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-[#FFF2F2] border border-[#FF3B30]/20 text-[#FF3B30] px-3.5 py-2.5 rounded-[10px] text-[13px]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5B7A9D] hover:bg-[#6B8AAD] active:bg-[#4A6A8D] text-white py-2.5 px-4 rounded-[10px] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-[#7A9BBD]/40 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px] transition-colors duration-150 tracking-[-0.01em]"
          >
            {loading ? 'Anmelden…' : 'Anmelden'}
          </button>
        </form>

        {/* Quick Login Buttons (Development) */}
        <div className="mt-4 space-y-2">
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
            className="w-full bg-[#1E2A3A] hover:bg-[#3D5167] text-white py-2 px-4 rounded-[10px] text-[13px] font-medium focus:outline-none disabled:opacity-40 transition-colors duration-150"
          >
            {loading ? 'Anmelden…' : 'Admin Login (Demo)'}
          </button>
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              setError(null);
              const supabase = createClient();

              // Try to log in first
              let { error } = await supabase.auth.signInWithPassword({
                email: 'kunde@test.de',
                password: 'kunde123',
              });

              // If login fails, create test data first
              if (error) {
                try {
                  await fetch('/api/seed', { method: 'POST' });
                  // Try login again after seed
                  const result = await supabase.auth.signInWithPassword({
                    email: 'kunde@test.de',
                    password: 'kunde123',
                  });
                  error = result.error;
                } catch {
                  setError('Test-Daten konnten nicht erstellt werden.');
                  setLoading(false);
                  return;
                }
              }

              if (error) {
                setError('Kunden-Login fehlgeschlagen.');
                setLoading(false);
                return;
              }
              router.push('/dashboard');
              router.refresh();
            }}
            disabled={loading}
            className="w-full bg-[#1E2A3A] hover:bg-[#F5F5F7] border border-black/10 text-[#EDF1F5] py-2 px-4 rounded-[10px] text-[13px] font-medium focus:outline-none disabled:opacity-40 transition-colors duration-150"
          >
            {loading ? 'Anmelden…' : 'Kunden Login (Demo)'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a
            href="/reset-password"
            className="text-[13px] text-[#7A9BBD] hover:text-[#6B8AAD] transition-colors"
          >
            Passwort vergessen?
          </a>
        </div>
      </div>
    </div>
  );
}
