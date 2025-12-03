import SenseMapperLoader from '@/components/sense-mapper/SenseMapperLoader';
import { initializeFirebase } from '@/firebase/server';
import { doc, getDoc } from 'firebase/firestore';
import { MapData } from '@/lib/types';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';

async function getMapData(mapId: string): Promise<{mapData: MapData | null, editCode?: string}> {
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
    
    // The editCode is sensitive and should only be returned if it's going to be used securely.
    // In this case, it's passed to a server component that decides the readOnly state.
    const editCode = serializableData.editCode;
    // We don't delete the editCode from the data passed to the client here.
    // The loader will handle it.

    return { mapData: serializableData as MapData, editCode };
}

type Props = {
  params: { mapId: string };
  searchParams: { editCode?: string };
}

export default async function SharedMapPage(props: Props) {
    const { mapId } = props.params;
    const { editCode: queryEditCode } = props.searchParams;

    const { mapData, editCode: correctEditCode } = await getMapData(mapId);

    if (!mapData) {
        notFound();
    }
    
    // Determine if the user has editing rights
    const isEditing = !!(queryEditCode && correctEditCode && queryEditCode === correctEditCode);
    const readOnly = !isEditing;
    
    // We only pass the editCode to the client if it's correct.
    const editCodeForClient = isEditing ? queryEditCode : undefined;

    // Remove the edit code from the initial data passed to the client if not editing.
    if(readOnly && mapData) {
        delete mapData.editCode;
    }
    
    return (
        <SenseMapperLoader 
            initialData={mapData} 
            readOnly={readOnly} 
            mapId={mapId} 
            editCode={editCodeForClient}
        />
    );
}
