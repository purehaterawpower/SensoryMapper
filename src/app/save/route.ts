'use server';

import { initializeFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';
import { MapData } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { firestore } = initializeFirebase();
    const mapData: MapData = await req.json();

    if (!mapData.mapImage || !mapData.items || !mapData.imageDimensions) {
        return NextResponse.json({ error: 'Invalid map data' }, { status: 400 });
    }

    const docRef = await addDoc(collection(firestore, 'sensoryMaps'), {
      ...mapData,
      createdAt: serverTimestamp()
    });

    return NextResponse.json({ id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error('Error saving map:', error);
    return NextResponse.json({ error: 'Failed to save map' }, { status: 500 });
  }
}
