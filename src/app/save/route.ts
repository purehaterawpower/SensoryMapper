'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { MapData } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { firestore } = initializeFirebase();
    // The request body includes items, even though it's not on the MapData type.
    const mapData: MapData & { items: any[] } = await req.json();

    if (!mapData.mapImage || !mapData.imageDimensions || !mapData.items) {
        return NextResponse.json({ error: 'Invalid map data' }, { status: 400 });
    }

    const docRef = await addDoc(collection(firestore, 'sensoryMaps'), {
      mapImage: mapData.mapImage,
      imageDimensions: mapData.imageDimensions,
      items: mapData.items,
      createdAt: serverTimestamp()
    });

    return NextResponse.json({ id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error('Error saving map:', error);
    return NextResponse.json({ error: 'Failed to save map' }, { status: 500 });
  }
}
