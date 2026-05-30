import { env } from './env';

let firebaseApp: any = null;

export function getFirebaseApp() {
  if (firebaseApp) return firebaseApp;

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_PRIVATE_KEY || !env.FIREBASE_CLIENT_EMAIL) {
    return null;
  }

  const admin = require('firebase-admin');
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.FIREBASE_PROJECT_ID,
      privateKey: env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
    }),
  });

  return firebaseApp;
}
