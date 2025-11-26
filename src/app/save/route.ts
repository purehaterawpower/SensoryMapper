import { initializeFirebase } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { firestore } = initializeFirebase();
    const mapData = await req.json();

    if (!mapData.mapImage || !mapData.items || !mapData.imageDimensions) {
        return NextResponse.json({ error: 'Invalid map data' }, { status: 400 });
    }

    const docRef = await addDoc(collection(firestore, 'maps'), mapData);

    return NextResponse.json({ id: docRef.id }, { status: 200 });
  } catch (error) {
    console.error('Error saving map:', error);
    return NextResponse.json({ error: 'Failed to save map' }, { status: 500 });
  }
}
