'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { MapData } from '@/lib/types';
import { useSearchParams } from 'next/navigation';

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
  const searchParams = useSearchParams();
  const editCode = searchParams.get('editCode') || undefined;
  
  // If initialReadOnly is explicitly passed (from server), use it.
  // Otherwise (on client-side navigation or new maps), determine based on editCode.
  const readOnly = initialReadOnly === undefined ? !editCode : initialReadOnly;

  return <SenseMapper initialData={initialData} readOnly={readOnly} mapId={mapId} editCode={editCode} />;
}
