import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyC9YM0qnctZzWRvLyApyeWyC5ag7dhUWRA',
  authDomain: 'vault-c5cc8.firebaseapp.com',
  projectId: 'vault-c5cc8',
  storageBucket: 'vault-c5cc8.firebasestorage.app',
  messagingSenderId: '982045140211',
  appId: '1:982045140211:web:dc956acb5c5379b4c44386',
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
