'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

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

export default function SenseMapperLoader() {
  return <SenseMapper />;
}
