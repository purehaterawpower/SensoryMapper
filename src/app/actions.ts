'use server';

import { initializeFirebase } from '@/firebase/server';
import { collection, addDoc, serverTimestamp, doc, updateDoc, getDoc } from 'firebase/firestore';
import { MapData } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { randomUUID } from 'crypto';

export async function createMap(mapData: MapData) {
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
    
    revalidatePath(`/map/${docRef.id}`);
    
    return { id: docRef.id, editCode, error: null };

  } catch (error: any) {
    console.error('Error creating map:', error);
    const errorMessage = error.message || 'Failed to save map due to a server error.';
    return { id: null, editCode: null, error: errorMessage };
  }
}

export async function updateMap(mapId: string, mapData: MapData, editCode: string) {
  try {
    const { firestore } = await initializeFirebase();

    const mapRef = doc(firestore, 'sensoryMaps', mapId);
    const mapSnap = await getDoc(mapRef);

    if (!mapSnap.exists()) {
      throw new Error('Map not found.');
    }

    if (mapSnap.data().editCode !== editCode) {
      throw new Error('Unauthorized: Invalid edit code.');
    }

    await updateDoc(mapRef, {
      ...mapData,
      // We don't update the editCode or createdAt timestamp on update
    });

    revalidatePath(`/map/${mapId}`);
    
    return { id: mapId, error: null };

  } catch (error: any)
  {
    console.error('Error updating map:', error);
    const errorMessage = error.message || 'Failed to update map due to a server error.';
    return { id: null, error: errorMessage };
  }
}
