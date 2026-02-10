'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { QuickAddMandant } from '@/components/forms/quick-add-mandant';
import { Plus, UserPlus } from 'lucide-react';

export function MandantenActions() {
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  return (
    <>
      <div className="flex gap-3">
        <Button onClick={() => setShowQuickAdd(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Mandant hinzufügen
        </Button>
        <Link href="/mandanten/neu">
          <Button variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Erweitert
          </Button>
        </Link>
      </div>

      <QuickAddMandant
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
      />
    </>
  );
}
