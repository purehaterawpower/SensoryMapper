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
    initialData?: MapData;
    readOnly?: boolean;
    mapId?: string;
    editCode?: string;
}

export default function SenseMapperLoader({ initialData, readOnly, mapId, editCode }: SenseMapperLoaderProps) {
  // The readOnly prop is now definitively determined by the server component (page.tsx).
  // The editCode is also passed down if editing is allowed.
  return <SenseMapper initialData={initialData} readOnly={readOnly} mapId={mapId} editCode={editCode} />;
}
