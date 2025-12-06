
'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { MapData } from '@/lib/types';

const SenseMapper = dynamic(() => import('@/components/sense-mapper/SenseMapper').then(mod => mod.SenseMapper), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen bg-background font-body text-foreground">
      <Skeleton className="w-80" />
      <div className="flex-1 p-4">
        <Skeleton className="w-full h-full rounded-lg" />
      </div>
    </div>
  ),
});

type SenseMapperLoaderProps = {
    initialData?: MapData | null;
    readOnly?: boolean;
    mapId?: string;
    editCode?: string;
}

export default function SenseMapperLoader({ initialData, readOnly, mapId, editCode }: SenseMapperLoaderProps) {
  // By creating a unique key from the mapId and editCode, we force React to
  // completely re-mount the SenseMapper component when the user navigates
  // from a new map to a saved map. This is critical to prevent stale state
  // and ensure the component initializes with the correct props.
  const componentKey = `${mapId || 'new'}-${editCode || 'no-code'}`;

  return <SenseMapper key={componentKey} initialData={initialData} readOnly={readOnly} mapId={mapId} editCode={editCode} />;
}
