import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCVV4cXuXKj6ZEaLZiYAENusVlf2U4Zx5U",
  authDomain: "agroscan-app-ead1f.firebaseapp.com",
  projectId: "agroscan-app-ead1f",
  storageBucket: "agroscan-app-ead1f.firebasestorage.app",
  messagingSenderId: "819982327224",
  appId: "1:819982327224:web:441ebd8feefdb519cb434d",
  measurementId: "G-758DV085WD"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth };