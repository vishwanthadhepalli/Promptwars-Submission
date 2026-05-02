import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Validate connection on boot
async function validateConnection() {
  try {
    await getDocFromServer(doc(db, '__test__', 'connection'));
  } catch (error: any) {
    if (error?.message?.includes('offline')) {
      console.error('Firebase client is offline. Check configuration.');
    }
  }
}
validateConnection();
