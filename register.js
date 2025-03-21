import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  getFirestore,
  setDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

// Kontrolli, kas Firebase Config on saadaval
if (!window.FIREBASE_CONFIG) {
  console.error(
    "⚠ Firebase konfiguratsiooni ei leitud! Kontrolli, kas `config.js` on õigesti laaditud.",
  );
} else {
  const app = initializeApp(window.FIREBASE_CONFIG);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // Tee Firebase objektid globaalselt kättesaadavaks
  window.auth = auth;
  window.db = db;
}

// Registreerimise loogika
document
  .getElementById("registerForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!username || !email || !password) {
      alert("Palun täida kõik väljad!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const user = userCredential.user;

      // Salvesta kasutaja Firestore'i
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        role: "active", // või "guest"
        settings: {},
        searches: [],
      });

      alert("Registreerimine õnnestus! Suuname pealehele...");
      window.location.href = "index.html";
    } catch (error) {
      console.error("Registreerimisviga:", error);
      alert(error.message);
    }
  });
