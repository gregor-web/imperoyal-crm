'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Lock, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Das Passwort muss mindestens 6 Zeichen haben.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein.');
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E2A3A] mb-2">
            Passwort aktualisiert
          </h1>
          <p className="text-[#4A6A8D] mb-6">
            Ihr Passwort wurde erfolgreich geändert. Sie können sich jetzt mit
            Ihrem neuen Passwort anmelden.
          </p>
          <Link
            href="/login"
            className="inline-block w-full bg-gradient-to-r from-[#1E2A3A] to-[#2A3F54] text-white py-3 px-4 rounded-lg font-medium hover:from-[#2A3F54] hover:to-[#3D5167] transition-all"
          >
            Zum Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="glass-card rounded-2xl p-6 sm:p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1E2A3A] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#1E2A3A]">
            Neues Passwort festlegen
          </h1>
          <p className="text-[#4A6A8D] mt-2">
            Geben Sie Ihr neues Passwort ein.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#1E2A3A] mb-1"
            >
              Neues Passwort
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="glass-input w-full px-4 py-3 rounded-lg text-[#1E2A3A] placeholder-[#9EAFC0] focus:outline-none focus:ring-2 focus:ring-[#5B7A9D]"
              placeholder="Mindestens 6 Zeichen"
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-[#1E2A3A] mb-1"
            >
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="glass-input w-full px-4 py-3 rounded-lg text-[#1E2A3A] placeholder-[#9EAFC0] focus:outline-none focus:ring-2 focus:ring-[#5B7A9D]"
              placeholder="Passwort wiederholen"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-[#1E2A3A] to-[#2A3F54] text-white py-3 px-4 rounded-lg font-medium hover:from-[#2A3F54] hover:to-[#3D5167] focus:outline-none focus:ring-2 focus:ring-[#5B7A9D] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? 'Wird gespeichert...' : 'Passwort speichern'}
          </button>
        </form>
      </div>
    </div>
  );
}
