'use client';

import { Card } from '@/components/ui/card';
import { DynamicLageplanMap } from '@/components/maps/lageplan-map-dynamic';

interface ObjektMapCardProps {
  strasse: string;
  plz: string;
  ort: string;
}

export function ObjektMapCard({ strasse, plz, ort }: ObjektMapCardProps) {
  const adresse = `${strasse}, ${plz} ${ort}`;

  return (
    <Card title="Lageplan">
      <div className="rounded-lg overflow-hidden -mx-4 -mb-4 sm:-mx-5 sm:-mb-5">
        <DynamicLageplanMap address={adresse} height={300} />
      </div>
    </Card>
  );
}
