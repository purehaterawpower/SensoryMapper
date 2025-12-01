'use server';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let _serverApp: FirebaseApp;

/**
 * Initializes and returns a server-side Firebase instance.
 * Ensures that initialization only happens once.
 */
export async function initializeFirebase() {
  if (!getApps().some(app => app.name === 'server')) {
    try {
      _serverApp = initializeApp(firebaseConfig, 'server');
    } catch (e) {
      console.error('Server-side Firebase initialization failed:', e);
      throw new Error('Could not initialize Firebase on the server.');
    }
  } else {
    _serverApp = getApp('server');
  }

  return {
    firebaseApp: _serverApp,
    auth: getAuth(_serverApp),
    firestore: getFirestore(_serverApp),
  };
}
