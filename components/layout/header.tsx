'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface Profile {
  name: string;
  email: string;
  role: 'admin' | 'mandant';
}

export function Header() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from('profiles')
        .select('name, email, role')
        .single();

      if (data) {
        setProfile(data as Profile);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <header className="h-16 glass-card border-b border-white/20 flex items-center justify-between px-6">
      {/* Page Title Area - can be customized per page */}
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-slate-700">
          Imperoyal Immobilien
        </h2>
      </div>

      {/* Right Side - Logo & User Menu */}
      <div className="flex items-center gap-6">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center">
          <Image
            src="/logo_imperoyal.png"
            alt="Imperoyal Immobilien"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 p-2 hover:bg-white/30 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-700">
                {profile?.name || 'Laden...'}
              </p>
              <p className="text-xs text-slate-500">
                {profile?.role === 'admin' ? 'Administrator' : 'Mandant'}
              </p>
            </div>
          </button>

          {/* Dropdown */}
          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 glass-card rounded-lg shadow-lg py-2 z-20">
                <div className="px-4 py-2 border-b border-slate-200">
                  <p className="text-sm font-medium text-slate-700">{profile?.name}</p>
                  <p className="text-xs text-slate-500">{profile?.email}</p>
                </div>
                <Link
                  href="/einstellungen"
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                  onClick={() => setShowDropdown(false)}
                >
                  <Settings className="w-4 h-4" />
                  Einstellungen
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <LogOut className="w-4 h-4" />
                  Abmelden
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
