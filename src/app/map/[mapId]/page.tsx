

import SenseMapperLoader from '@/components/sense-mapper/SenseMapperLoader';
import { initializeFirebase } from '@/firebase/server';
import { doc, getDoc } from 'firebase/firestore';
import { MapData } from '@/lib/types';
import { notFound } from 'next/navigation';

async function getMapData(mapId: string): Promise<{mapData: MapData | null, dbEditCode?: string}> {
    const { firestore } = await initializeFirebase();
    const mapRef = doc(firestore, 'sensoryMaps', mapId);
    const mapSnap = await getDoc(mapRef);

    if (!mapSnap.exists()) {
        return { mapData: null };
    }

    const data = mapSnap.data();
    
    const serializableData: any = { ...data };

    if (serializableData.createdAt && typeof serializableData.createdAt.toDate === 'function') {
        serializableData.createdAt = null;
    }
    
    const dbEditCode = serializableData.editCode;

    return { mapData: serializableData as MapData, dbEditCode };
}

type Props = {
  params: { mapId: string };
  searchParams: { editCode?: string };
}

export default async function SharedMapPage(props: Props) {
    const { mapId } = props.params;
    const { editCode: queryEditCode } = props.searchParams;

    const { mapData, dbEditCode } = await getMapData(mapId);

    if (!mapData) {
        notFound();
    }
    
    // Determine if the user has editing rights.
    const isEditing = !!(queryEditCode && dbEditCode && queryEditCode === dbEditCode);
    const readOnly = !isEditing;
    
    // Defensively remove the edit code from the initial data if the user is in read-only mode.
    if(readOnly && mapData) {
        delete mapData.editCode;
    }
    
    return (
        <SenseMapperLoader 
            initialData={mapData} 
            readOnly={readOnly} 
            mapId={mapId} 
            editCode={isEditing ? queryEditCode : undefined}
        />
    );
}
