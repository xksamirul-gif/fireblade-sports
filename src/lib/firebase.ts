import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operation: FirestoreErrorInfo['operationType'], path: string | null = null) {
  if (error?.code === 'permission-denied') {
    const info: FirestoreErrorInfo = {
      error: error.message,
      operationType: operation,
      path: path,
      authInfo: {
        userId: auth.currentUser?.uid || 'unauthenticated',
        email: auth.currentUser?.email || '',
        emailVerified: auth.currentUser?.emailVerified || false,
        isAnonymous: auth.currentUser?.isAnonymous || false,
        providerInfo: auth.currentUser?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    
    let friendlyMessage = "Tactical Access Denied: You do not have the required clearance for this operation.";
    if (operation === 'list' && path === 'admin_logs') {
      friendlyMessage = "Command Only: You must be an authorized Admin to view tactical logs.";
    } else if (path?.includes('notifications')) {
      friendlyMessage = "Security Breach: You can only access your own encrypted communications.";
    }

    console.error('Firestore Permission Denied:', JSON.stringify(info, null, 2));
    const errorWithLink = new Error(`${friendlyMessage} If you believe this is an error, please contact Command via WhatsApp Support.`);
    (errorWithLink as any).tacticalInfo = info;
    throw errorWithLink;
  }
  
  if (error?.code === 'unavailable') {
    throw new Error("Comm Link Interrupted: FireBlade servers are currently unreachable. Retrying synchronization...");
  }

  throw error;
}
