'use server';

import { initializeFirebase } from '@/firebase/server';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { MapData } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export async function saveMap(mapData: MapData) {
  try {
    const { firestore } = await initializeFirebase();
    
    if (!mapData.mapImage || !mapData.imageDimensions || !mapData.items) {
      throw new Error('Invalid map data');
    }

    const docRef = await addDoc(collection(firestore, 'sensoryMaps'), {
      ...mapData,
      createdAt: serverTimestamp()
    });
    
    revalidatePath('/map/[mapId]');
    return { id: docRef.id, error: null };

  } catch (error: any) {
    console.error('Error saving map:', error);
    const errorMessage = error.message || 'Failed to save map';
    return { id: null, error: errorMessage };
  }
}
