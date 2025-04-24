import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
import { rateLimit, csrfProtection, sessionManager } from './security-middleware.js';

// Get client IP (in a real production environment, this would be done server-side)
const getClientIP = async () => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'unknown';
  }
};

// Function to show/hide authentication screen
async function toggleAuthScreen(user) {
  const authContainer = document.getElementById('authContainer');
  const mainContent = document.querySelector('main');

  if (user) {
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('📜 Firestore roll:', userData.role);
        window.userRole = userData.role;

        // Create session
        const sessionId = sessionManager.createSession(user.uid);
        localStorage.setItem('sessionId', sessionId);

        // Generate CSRF token
        const csrfToken = csrfProtection.setToken(sessionId);
        localStorage.setItem('csrfToken', csrfToken);
      } else {
        console.log('No user document found');
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }

    authContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');
    document.getElementById('logoutBtn').classList.remove('hidden');
    console.log(`✅ Kasutaja sisse logitud: ${user.email}`);
  } else {
    window.userRole = null;
    // Clear session and CSRF token
    const sessionId = localStorage.getItem('sessionId');
    if (sessionId) {
      sessionManager.clearSession(sessionId);
      localStorage.removeItem('sessionId');
      localStorage.removeItem('csrfToken');
    }

    authContainer.classList.remove('hidden');
    mainContent.classList.add('hidden');
    document.getElementById('logoutBtn').classList.add('hidden');
    console.log('❌ Kasutaja välja logitud.');
  }
}

// Register User
async function register() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Check rate limit
  const clientIP = await getClientIP();
  if (!rateLimit.checkLimit(clientIP)) {
    alert('❌ Liiga palju katsetusi. Palun proovige hiljem uuesti.');
    return;
  }

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert('✅ Konto loodud!'))
    .catch(error => alert(`❌ Viga: ${error.message}`));
}

// Log In User
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Check rate limit
  const clientIP = await getClientIP();
  if (!rateLimit.checkLimit(clientIP)) {
    alert('❌ Liiga palju katsetusi. Palun proovige hiljem uuesti.');
    return;
  }

  signInWithEmailAndPassword(auth, email, password)
    .then(() => alert('✅ Sisselogimine õnnestus!'))
    .catch(error => alert(`❌ Viga: ${error.message}`));
}

// Log Out User
function logout() {
  const sessionId = localStorage.getItem('sessionId');
  if (!sessionId || !sessionManager.validateSession(sessionId)) {
    alert('❌ Sessioon on aegunud. Palun logige uuesti sisse.');
    return;
  }

  signOut(auth)
    .then(() => {
      sessionManager.clearSession(sessionId);
      localStorage.removeItem('sessionId');
      localStorage.removeItem('csrfToken');
      alert('👋 Olete välja logitud!');
    })
    .catch(error => alert(`❌ Viga: ${error.message}`));
}

// Track User Authentication State
onAuthStateChanged(auth, toggleAuthScreen);

// Session refresh interval
setInterval(() => {
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    if (!sessionManager.validateSession(sessionId)) {
      // Session expired, log out user
      logout();
    } else {
      sessionManager.refreshSession(sessionId);
    }
  }
}, 60000); // Check every minute

// Attach functions to `window`
window.register = register;
window.login = login;
window.logout = logout;
