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
    // The data from firestore will not be serializable, so we need to convert it.
    // We are just removing the timestamp for now.
    const serializableData = {
        ...data,
        createdAt: null,
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
