'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Loader2, Building2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function InteresseContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'already_exists' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [objektAdresse, setObjektAdresse] = useState('');

  useEffect(() => {
    const registerInterest = async () => {
      const objekt_id = searchParams.get('objekt');
      const mandant_id = searchParams.get('m');
      const ankaufsprofil_id = searchParams.get('ap');

      if (!objekt_id || !mandant_id) {
        setStatus('error');
        setMessage('Ungültiger Link. Bitte kontaktieren Sie uns direkt.');
        return;
      }

      try {
        const response = await fetch('/api/interesse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            objekt_id,
            mandant_id,
            ankaufsprofil_id,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Fehler bei der Registrierung');
        }

        if (data.already_exists) {
          setStatus('already_exists');
          setMessage('Sie haben bereits Interesse an diesem Objekt bekundet. Wir werden uns in Kürze bei Ihnen melden.');
        } else {
          setStatus('success');
          setMessage(data.message || 'Ihr Interesse wurde erfolgreich registriert.');
        }

        if (data.objekt?.adresse) {
          setObjektAdresse(data.objekt.adresse);
        }
      } catch (error) {
        setStatus('error');
        setMessage(error instanceof Error ? error.message : 'Ein Fehler ist aufgetreten.');
      }
    };

    registerInterest();
  }, [searchParams]);

  return (
    <>
      {/* Status Display */}
      {status === 'loading' && (
        <div className="py-8">
          <Loader2 className="w-12 h-12 text-[#5B7A9D] animate-spin mx-auto mb-4" />
          <p className="text-[#4A6A8D]">Interesse wird registriert...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E2A3A] mb-2">Interesse registriert!</h2>
          {objektAdresse && (
            <p className="text-sm text-[#5B7A9D] mb-4">
              Objekt: {objektAdresse}
            </p>
          )}
          <p className="text-[#4A6A8D] mb-6">{message}</p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
            <p className="text-sm text-amber-800">
              <strong>Nächste Schritte:</strong><br />
              Unser Team wird Sie in Kürze kontaktieren, um Ihnen weitere Informationen und ein detailliertes Exposé zukommen zu lassen.
            </p>
          </div>
        </div>
      )}

      {status === 'already_exists' && (
        <div className="py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#D5DEE6] mb-4">
            <CheckCircle className="w-10 h-10 text-[#5B7A9D]" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E2A3A] mb-2">Bereits registriert</h2>
          {objektAdresse && (
            <p className="text-sm text-[#5B7A9D] mb-4">
              Objekt: {objektAdresse}
            </p>
          )}
          <p className="text-[#4A6A8D]">{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-[#1E2A3A] mb-2">Fehler</h2>
          <p className="text-[#4A6A8D] mb-6">{message}</p>
          <p className="text-sm text-[#5B7A9D]">
            Bei Fragen erreichen Sie uns unter:<br />
            <a href="mailto:kontakt@imperoyal.de" className="text-[#5B7A9D] hover:underline">
              kontakt@imperoyal.de
            </a>
          </p>
        </div>
      )}
    </>
  );
}

function LoadingState() {
  return (
    <div className="py-8">
      <Loader2 className="w-12 h-12 text-[#5B7A9D] animate-spin mx-auto mb-4" />
      <p className="text-[#4A6A8D]">Wird geladen...</p>
    </div>
  );
}

export default function InteressePage() {
  return (
    <div className="min-h-screen login-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-6 sm:p-8 text-center">
          {/* Logo/Brand */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4">
              <Building2 className="w-8 h-8 text-[#1E2A3A]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#1E2A3A]">Imperoyal Immobilien</h1>
          </div>

          <Suspense fallback={<LoadingState />}>
            <InteresseContent />
          </Suspense>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-[#D5DEE6]">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-[#5B7A9D] hover:text-[#2A3F54]"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Zum Portal
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-[#9EAFC0] text-xs mt-6">
          © 2026 Imperoyal Immobilien. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  );
}
