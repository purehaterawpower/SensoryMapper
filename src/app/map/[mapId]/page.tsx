
import SenseMapperLoader from '@/components/sense-mapper/SenseMapperLoader';
import { initializeFirebase } from '@/firebase/server';
import { doc, getDoc } from 'firebase/firestore';
import { MapData } from '@/lib/types';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';

async function getMapData(mapId: string): Promise<{mapData: MapData | null, dbEditCode?: string}> {
    const { firestore } = await initializeFirebase();
    const mapRef = doc(firestore, 'sensoryMaps', mapId);
    const mapSnap = await getDoc(mapRef);

    if (!mapSnap.exists()) {
        return { mapData: null };
    }

    const data = mapSnap.data();
    
    const serializableData: any = { ...data };

    // Firestore Timestamps are not serializable and will cause errors when passing from
    // Server Components to Client Components. We can nullify it here as the client doesn't use it.
    if (serializableData.createdAt && typeof serializableData.createdAt.toDate === 'function') {
        serializableData.createdAt = null;
    }
    
    // The edit code is part of the document, return it separately
    const dbEditCode = serializableData.editCode;

    // Do not send the edit code to the client as part of the main data blob
    delete serializableData.editCode;

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
    
    // Pass the editCode to the client only if it's in edit mode.
    const editCodeForClient = isEditing ? queryEditCode : undefined;
    
    return (
        <SenseMapperLoader 
            initialData={mapData} 
            readOnly={readOnly} 
            mapId={mapId} 
            editCode={editCodeForClient}
        />
    );
}
