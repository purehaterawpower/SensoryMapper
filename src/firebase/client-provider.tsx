'use client';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';

interface FirebaseContextType {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

let firebaseContext: FirebaseContextType | undefined;

export function FirebaseClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (firebaseContext === undefined) {
    firebaseContext = initializeFirebase();
  }
  return <FirebaseProvider {...firebaseContext}>{children}</FirebaseProvider>;
}

    