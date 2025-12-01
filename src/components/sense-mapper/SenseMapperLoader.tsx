'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { MapData } from '@/lib/types';
import { useEffect, useState } from 'react';

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
}

export default function SenseMapperLoader({ initialData, readOnly: initialReadOnly, mapId }: SenseMapperLoaderProps) {
  const [readOnly, setReadOnly] = useState(initialReadOnly);

  useEffect(() => {
    if (mapId) {
      const storedMaps = JSON.parse(localStorage.getItem('senseMapperEditCodes') || '{}');
      const editCode = storedMaps[mapId];
      if (editCode) {
        // If we have an edit code, we can potentially enable editing.
        // We construct a URL with the edit code and reload if not already present.
        const currentUrl = new URL(window.location.href);
        if (currentUrl.searchParams.get('editCode') !== editCode) {
          currentUrl.searchParams.set('editCode', editCode);
          window.location.href = currentUrl.toString();
        } else {
          // The URL is correct, ensure we are not in read-only mode
          setReadOnly(false);
        }
      } else {
        setReadOnly(initialReadOnly);
      }
    } else {
      setReadOnly(initialReadOnly);
    }
  }, [mapId, initialReadOnly]);

  return <SenseMapper initialData={initialData} readOnly={readOnly} mapId={mapId} />;
}
