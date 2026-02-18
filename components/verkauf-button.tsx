'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { createClient } from '@/lib/supabase/client';
import { Loader2, Tag, X, Search, Shield, Bell, Handshake, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VerkaufButtonProps {
  objektId: string;
  initialZumVerkauf: boolean;
}

export function VerkaufButton({ objektId, initialZumVerkauf }: VerkaufButtonProps) {
  const [zumVerkauf, setZumVerkauf] = useState(initialZumVerkauf);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (!zumVerkauf) {
      // Noch nicht zum Verkauf → Modal mit Erklärung anzeigen
      setShowModal(true);
      return;
    }

    // Bereits zum Verkauf → direkt deaktivieren
    await updateVerkaufStatus(false);
  };

  const handleConfirmVerkauf = async () => {
    await updateVerkaufStatus(true);
    setShowModal(false);
  };

  const updateVerkaufStatus = async (newStatus: boolean) => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('objekte')
        .update({
          zum_verkauf: newStatus,
          zum_verkauf_seit: newStatus ? new Date().toISOString() : null,
        })
        .eq('id', objektId);

      if (error) throw error;

      setZumVerkauf(newStatus);
      toast.success(
        newStatus
          ? 'Objekt als verkaufsbereit markiert'
          : 'Verkaufsmarkierung entfernt'
      );
    } catch {
      toast.error('Fehler beim Aktualisieren');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={handleToggle}
        disabled={loading}
        className={
          zumVerkauf
            ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 hover:bg-red-500/15 hover:text-red-400 hover:border-red-400/30'
            : 'bg-[#253546] text-[#EDF1F5] border border-white/[0.12] hover:border-[#22c55e]/50 hover:bg-[#22c55e]/10 hover:text-[#22c55e]'
        }
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : zumVerkauf ? (
          <X className="w-4 h-4 mr-2" />
        ) : (
          <Tag className="w-4 h-4 mr-2" />
        )}
        {loading
          ? 'Wird gespeichert...'
          : zumVerkauf
            ? 'Verkauf stoppen'
            : 'Zum Verkauf anbieten'}
      </Button>

      {/* Erklärendes Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Objekt zum Verkauf anbieten" size="md">
        <div className="space-y-5">
          {/* Intro */}
          <p className="text-[#9EAFC0] text-sm leading-relaxed">
            Wenn Sie Ihr Objekt als verkaufsbereit markieren, passiert Folgendes:
          </p>

          {/* Schritte */}
          <div className="space-y-4">
            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-xl bg-[#5B7A9D]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Search className="w-4 h-4 text-[#7A9BBD]" />
              </div>
              <div>
                <p className="font-semibold text-[#EDF1F5] text-sm">Automatischer Käufer-Abgleich</p>
                <p className="text-[#7A9BBD] text-xs mt-1 leading-relaxed">
                  Ihr Objekt wird täglich mit allen hinterlegten Ankaufsprofilen abgeglichen – 
                  Kaufpreis, Assetklasse, Region und weitere Kriterien werden geprüft.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-xl bg-[#22c55e]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-4 h-4 text-[#22c55e]" />
              </div>
              <div>
                <p className="font-semibold text-[#EDF1F5] text-sm">Ausgeschlossene Partner werden berücksichtigt</p>
                <p className="text-[#7A9BBD] text-xs mt-1 leading-relaxed">
                  Käufer, die in ihrem Ankaufsprofil bestimmte Unternehmen ausgeschlossen haben, 
                  werden automatisch herausgefiltert. Ebenso umgekehrt.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-xl bg-[#FF9500]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Bell className="w-4 h-4 text-[#FF9500]" />
              </div>
              <div>
                <p className="font-semibold text-[#EDF1F5] text-sm">Imperoyal wird benachrichtigt</p>
                <p className="text-[#7A9BBD] text-xs mt-1 leading-relaxed">
                  Bei passenden Treffern wird unser Team informiert und nimmt Kontakt mit Ihnen und 
                  dem potenziellen Käufer auf – diskret und vertraulich.
                </p>
              </div>
            </div>

            <div className="flex gap-3.5 items-start">
              <div className="w-9 h-9 rounded-xl bg-[#7A9BBD]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Handshake className="w-4 h-4 text-[#7A9BBD]" />
              </div>
              <div>
                <p className="font-semibold text-[#EDF1F5] text-sm">Keine Verpflichtung</p>
                <p className="text-[#7A9BBD] text-xs mt-1 leading-relaxed">
                  Sie können die Verkaufsmarkierung jederzeit wieder entfernen. 
                  Es entstehen keine Kosten und keine Verpflichtung zum Verkauf.
                </p>
              </div>
            </div>
          </div>

          {/* Info-Box */}
          <div className="p-3.5 rounded-xl bg-[#5B7A9D]/10 border border-[#5B7A9D]/20">
            <p className="text-[#9EAFC0] text-xs leading-relaxed">
              <strong className="text-[#EDF1F5]">Hinweis:</strong> Ihre Kontaktdaten werden erst nach Ihrer ausdrücklichen 
              Zustimmung an potenzielle Käufer weitergegeben. Der Abgleich erfolgt anonym.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-1">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-3 sm:py-2.5 text-[#9EAFC0] hover:bg-white/[0.06] rounded-xl transition-colors min-h-[44px] text-center text-sm"
            >
              Abbrechen
            </button>
            <button
              onClick={handleConfirmVerkauf}
              disabled={loading}
              className="px-5 py-3 sm:py-2.5 bg-[#22c55e] hover:bg-[#16a34a] text-white rounded-xl transition-colors min-h-[44px] text-sm font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              {loading ? 'Wird aktiviert...' : 'Ja, zum Verkauf anbieten'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
