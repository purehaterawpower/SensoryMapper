'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { MapData } from '@/lib/types';
import { Item } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { firestore } = initializeFirebase();
    const mapData: MapData = await req.json();

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
  } catch (error: any) {
    console.error('Error saving map:', error);
    const errorMessage = error.message || 'Failed to save map';
    return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
  }
}
