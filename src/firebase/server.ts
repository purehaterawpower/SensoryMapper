'use server';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: This is the SERVER-SIDE Firebase initialization.
// It uses the Admin SDK for privileged access.
let _serverApp: FirebaseApp;

export async function initializeFirebase() {
  if (!getApps().length) {
    try {
      // Use service account for server-side initialization
      _serverApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.error('Server-side Firebase initialization failed:', e);
      // Fallback or handle error as needed
      throw new Error('Could not initialize Firebase on the server.');
    }
  } else {
    _serverApp = getApp();
  }

  return {
    firebaseApp: _serverApp,
    auth: getAuth(_serverApp),
    firestore: getFirestore(_serverApp),
  };
}
