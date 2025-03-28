import { auth } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";

// Function to show/hide authentication screen
function toggleAuthScreen(user) {
    const authContainer = document.getElementById("authContainer");
    const mainContent = document.querySelector("main");

    if (user) {
        authContainer.classList.add("hidden"); // Hide login screen
        mainContent.classList.remove("hidden"); // Show main content
        document.getElementById("logoutBtn").classList.remove("hidden");
        console.log(`✅ Kasutaja sisse logitud: ${user.email}`);
    } else {
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
        .catch(error => alert(`❌ Viga: ${error.message}`));
}

// 🔹 Log In User
function login() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    signInWithEmailAndPassword(auth, email, password)
        .then(() => alert("✅ Sisselogimine õnnestus!"))
        .catch(error => alert(`❌ Viga: ${error.message}`));
}

// 🔹 Log Out User
function logout() {
    signOut(auth)
        .then(() => alert("👋 Olete välja logitud!"))
        .catch(error => alert(`❌ Viga: ${error.message}`));
}

// 🔹 Track User Authentication State
onAuthStateChanged(auth, toggleAuthScreen);

// ✅ Attach functions to `window` so they work with event listeners
window.register = register;
window.login = login;
window.logout = logout;
