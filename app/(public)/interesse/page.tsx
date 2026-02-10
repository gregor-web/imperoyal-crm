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
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Interesse wird registriert...</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Interesse registriert!</h2>
          {objektAdresse && (
            <p className="text-sm text-slate-500 mb-4">
              Objekt: {objektAdresse}
            </p>
          )}
          <p className="text-slate-600 mb-6">{message}</p>
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <CheckCircle className="w-10 h-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Bereits registriert</h2>
          {objektAdresse && (
            <p className="text-sm text-slate-500 mb-4">
              Objekt: {objektAdresse}
            </p>
          )}
          <p className="text-slate-600">{message}</p>
        </div>
      )}

      {status === 'error' && (
        <div className="py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-2">Fehler</h2>
          <p className="text-slate-600 mb-6">{message}</p>
          <p className="text-sm text-slate-500">
            Bei Fragen erreichen Sie uns unter:<br />
            <a href="mailto:kontakt@imperoyal.de" className="text-blue-600 hover:underline">
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
      <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
      <p className="text-slate-600">Wird geladen...</p>
    </div>
  );
}

export default function InteressePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass-card rounded-2xl p-8 text-center">
          {/* Logo/Brand */}
          <div className="mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 mb-4">
              <Building2 className="w-8 h-8 text-slate-900" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-800">Imperoyal Immobilien</h1>
          </div>

          <Suspense fallback={<LoadingState />}>
            <InteresseContent />
          </Suspense>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Zum Portal
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <p className="text-center text-slate-400 text-xs mt-6">
          © 2025 Imperoyal Immobilien. Alle Rechte vorbehalten.
        </p>
      </div>
    </div>
  );
}
