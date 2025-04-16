import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyBnjmvUZ8T8rjd69YlvrwpMFwpAkONWm4E',
  authDomain: 'Riigihankeproject.firebaseapp.com',
  projectId: 'Riigihankeproject',
  storageBucket: 'Riigihankeproject.firebasestorage.com',
  messagingSenderId: '649897121077',
  appId: '1:649897121077:web:2ff628090dc51e4df8287c',
  measurementId: 'G-CGK6YHSDQ4',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
