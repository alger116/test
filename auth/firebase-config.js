import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import {
  getAuth,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
import { firebaseConfig } from './firebase-config-generated.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Set session persistence to browser session
setPersistence(auth, browserSessionPersistence);

// Session timeout duration (30 minutes in milliseconds)
const SESSION_TIMEOUT = 30 * 60 * 1000;
let sessionTimeoutId;
let isSessionActive = false;
let lastActivityTime = Date.now();

// Function to handle session timeout
const handleSessionTimeout = () => {
  const currentTime = Date.now();
  const timeSinceLastActivity = currentTime - lastActivityTime;

  if (isSessionActive && timeSinceLastActivity >= SESSION_TIMEOUT) {
    signOut(auth).then(() => {
      if (!window.location.pathname.includes('login.html')) {
        window.location.href = 'login.html';
      }
    });
  }
};

// Setup auth state listener
onAuthStateChanged(auth, user => {
  if (user) {
    isSessionActive = true;
    lastActivityTime = Date.now();

    // Clear any existing timeout
    if (sessionTimeoutId) clearTimeout(sessionTimeoutId);

    // Set new timeout
    sessionTimeoutId = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);

    // Add activity listeners to reset timeout
    const resetTimeout = () => {
      lastActivityTime = Date.now();
      if (sessionTimeoutId) clearTimeout(sessionTimeoutId);
      sessionTimeoutId = setTimeout(handleSessionTimeout, SESSION_TIMEOUT);
    };

    // Reset timeout on user activity
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, resetTimeout, { once: true });
    });
  } else {
    isSessionActive = false;
    if (sessionTimeoutId) {
      clearTimeout(sessionTimeoutId);
      sessionTimeoutId = null;
    }
  }
});

const db = getFirestore(app);

// Make Firebase instances available globally
window.firebaseApp = app;
window.firebaseAuth = auth;
window.firebaseDb = db;

export { auth, db };
