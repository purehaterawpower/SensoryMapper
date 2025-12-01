'use server';

import { initializeFirebase } from '@/firebase/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MapData } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function saveMap(mapData: MapData) {
  try {
    const { firestore } = await initializeFirebase();
    
    if (!mapData.mapImage || !mapData.imageDimensions || !mapData.items) {
      throw new Error('Invalid map data');
    }

    const editCode = randomUUID();

    const docRef = await addDoc(collection(firestore, 'sensoryMaps'), {
      ...mapData,
      editCode,
      createdAt: serverTimestamp()
    });
    
    // Revalidate the path for the newly created map to ensure it can be fetched immediately.
    revalidatePath(`/map/${docRef.id}`);
    
    return { id: docRef.id, editCode, error: null };

  } catch (error: any) {
    console.error('Error saving map:', error);
    // Return a more structured error to the client.
    const errorMessage = error.message || 'Failed to save map due to a server error.';
    return { id: null, editCode: null, error: errorMessage };
  }
}
