import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCllHwpqyioc7Rox5yQoGl0imy1pc4f3u4",
  authDomain: "gen-lang-client-0466906158.firebaseapp.com",
  projectId: "gen-lang-client-0466906158",
  storageBucket: "gen-lang-client-0466906158.firebasestorage.app",
  messagingSenderId: "20352282294",
  appId: "1:20352282294:web:a07a7e49933ac5e3f60017"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
