import SenseMapperLoader from '@/components/sense-mapper/SenseMapperLoader';
import { initializeFirebase } from '@/firebase/server';
import { doc, getDoc } from 'firebase/firestore';
import { MapData } from '@/lib/types';
import { notFound } from 'next/navigation';

async function getMapData(mapId: string): Promise<MapData | null> {
    const { firestore } = await initializeFirebase();
    const mapRef = doc(firestore, 'sensoryMaps', mapId);
    const mapSnap = await getDoc(mapRef);

    if (!mapSnap.exists()) {
        return null;
    }

    const data = mapSnap.data();
    
    // Convert Firestore Timestamp to null for serialization
    const serializableData: any = { ...data };
    if (serializableData.createdAt && typeof serializableData.createdAt.toDate === 'function') {
        serializableData.createdAt = null;
    }


    return serializableData as MapData;
}


export default async function SharedMapPage({ params }: { params: { mapId: string } }) {
    const mapData = await getMapData(params.mapId);

    if (!mapData) {
        notFound();
    }
    
    return (
        <SenseMapperLoader initialData={mapData} readOnly={true} />
    );
}
