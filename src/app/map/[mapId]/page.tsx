import SenseMapperLoader from '@/components/sense-mapper/SenseMapperLoader';
import { initializeFirebase } from '@/firebase/server';
import { doc, getDoc } from 'firebase/firestore';
import { MapData } from '@/lib/types';
import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';

async function getMapData(mapId: string): Promise<MapData | null> {
    const { firestore } = await initializeFirebase();
    const mapRef = doc(firestore, 'sensoryMaps', mapId);
    const mapSnap = await getDoc(mapRef);

    if (!mapSnap.exists()) {
        return null;
    }

    const data = mapSnap.data();
    
    // Convert Firestore Timestamp to a serializable format (e.g., null or ISO string)
    // before sending it to the client component.
    const serializableData: any = { ...data };
    if (serializableData.createdAt && typeof serializableData.createdAt.toDate === 'function') {
        serializableData.createdAt = null;
    }
    
    // The editCode should not be sent to the client unless verified.
    // The readOnly logic will handle the editing capabilities.
    delete serializableData.editCode;

    return serializableData as MapData;
}

type Props = {
  params: Promise<{ mapId: string }>;
  searchParams: { editCode?: string };
}

async function canEdit(mapId: string, providedEditCode?: string): Promise<boolean> {
    if (!providedEditCode) {
        return false;
    }

    const { firestore } = await initializeFirebase();
    const mapRef = doc(firestore, 'sensoryMaps', mapId);
    const mapSnap = await getDoc(mapRef);

    if (mapSnap.exists() && mapSnap.data().editCode === providedEditCode) {
        return true;
    }
    
    return false;
}


export default async function SharedMapPage(props: Props) {
    const { mapId } = await props.params;
    const { editCode: queryEditCode } = props.searchParams;

    const mapData = await getMapData(mapId);

    if (!mapData) {
        notFound();
    }
    
    const isEditing = await canEdit(mapId, queryEditCode);
    
    return (
        <SenseMapperLoader initialData={mapData} readOnly={!isEditing} mapId={mapId}/>
    );
}
