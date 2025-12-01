'use server';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

let _serverApp: FirebaseApp;

export async function initializeFirebase() {
  if (!getApps().length) {
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
