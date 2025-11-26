import SenseMapperLoader from '@/components/sense-mapper/SenseMapperLoader';
import { initializeFirebase } from '@/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { MapData } from '@/lib/types';
import { FirebaseProvider } from '@/firebase/provider';
import { notFound } from 'next/navigation';

async function getMapData(mapId: string): Promise<MapData | null> {
    const { firestore } = initializeFirebase();
    const mapRef = doc(firestore, 'maps', mapId);
    const mapSnap = await getDoc(mapRef);

    if (!mapSnap.exists()) {
        return null;
    }

    return mapSnap.data() as MapData;
}


export default async function SharedMapPage({ params }: { params: { mapId: string } }) {
    const mapData = await getMapData(params.mapId);

    if (!mapData) {
        notFound();
    }
    
    return (
        <FirebaseProvider>
            <SenseMapperLoader initialData={mapData} readOnly={true} />
        </FirebaseProvider>
    );
}

    