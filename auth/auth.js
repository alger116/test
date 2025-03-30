import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  doc,
  getDoc,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Function to show/hide authentication screen
async function toggleAuthScreen(user) {
  const authContainer = document.getElementById("authContainer");
  const mainContent = document.querySelector("main");

  if (user) {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("📜 Firestore roll:", userData.role);
        window.userRole = userData.role;
      } else {
        console.log("No user document found");
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }

    authContainer.classList.add("hidden"); // Hide login screen
    mainContent.classList.remove("hidden"); // Show main content
    document.getElementById("logoutBtn").classList.remove("hidden");
    console.log(`✅ Kasutaja sisse logitud: ${user.email}`);
  } else {
    window.userRole = null;
    authContainer.classList.remove("hidden"); // Show login screen
    mainContent.classList.add("hidden"); // Hide main content
    document.getElementById("logoutBtn").classList.add("hidden");
    console.log("❌ Kasutaja välja logitud.");
  }
}

// 🔹 Register User
function register() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => alert("✅ Konto loodud!"))
    .catch((error) => alert(`❌ Viga: ${error.message}`));
}

// 🔹 Log In User
function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => alert("✅ Sisselogimine õnnestus!"))
    .catch((error) => alert(`❌ Viga: ${error.message}`));
}

// 🔹 Log Out User
function logout() {
  signOut(auth)
    .then(() => alert("👋 Olete välja logitud!"))
    .catch((error) => alert(`❌ Viga: ${error.message}`));
}

// 🔹 Track User Authentication State
onAuthStateChanged(auth, toggleAuthScreen);

// ✅ Attach functions to `window` so they work with event listeners
window.register = register;
window.login = login;
window.logout = logout;
