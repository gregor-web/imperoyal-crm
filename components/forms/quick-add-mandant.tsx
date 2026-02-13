'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus, Mail, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface QuickAddMandantProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickAddMandant({ isOpen, onClose }: QuickAddMandantProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ password: string; emailSent: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/mandanten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Fehler beim Erstellen');
      }

      setSuccess({
        password: result.password,
        emailSent: result.emailSent,
      });
      toast.success('Mandant erfolgreich erstellt!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
      toast.error('Fehler beim Erstellen des Mandanten');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setEmail('');
    setError(null);
    setSuccess(null);
    onClose();
    if (success) {
      router.refresh();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Mandant hinzufügen" size="sm">
      {success ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <h3 className="text-lg font-semibold text-center text-slate-800">
            Mandant erfolgreich erstellt!
          </h3>

          {success.emailSent ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <Mail className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-800">
                Die Zugangsdaten wurden per E-Mail an <strong>{email}</strong> gesendet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <p className="text-sm text-amber-800">
                  E-Mail-Versand fehlgeschlagen. Bitte teilen Sie das Passwort manuell mit.
                </p>
              </div>

              <div className="p-4 bg-slate-100 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">Temporäres Passwort:</p>
                <code className="block text-lg font-mono font-semibold text-slate-800">
                  {success.password}
                </code>
              </div>
            </div>
          )}

          <Button onClick={handleClose} className="w-full">
            Schließen
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <Input
            label="Firmenname / Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z.B. Müller Immobilien GmbH"
            required
          />

          <Input
            label="E-Mail-Adresse"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />

          <p className="text-sm text-slate-500">
            Der Mandant erhält automatisch eine E-Mail mit seinen Zugangsdaten.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !name || !email}
              className="flex-1"
            >
              {isLoading ? (
                'Erstellen...'
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Erstellen
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
