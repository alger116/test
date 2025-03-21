import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDocs,
  collection,
  updateDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("dropdownButton")
    .addEventListener("click", function () {
      document.getElementById("dropdownMenu").classList.toggle("hidden");
    });

  document.getElementById("loginButton").addEventListener("click", function () {
    // Logic to open the login modal
  });

  document
    .getElementById("procurementForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      // Logic to handle form submission
    });

  document.getElementById("clearFields").addEventListener("click", function () {
    // Logic to clear form fields
  });

  document.getElementById("saveFields").addEventListener("click", function () {
    // Logic to save form fields
  });

  document
    .getElementById("refreshFields")
    .addEventListener("click", function () {
      // Logic to refresh form fields
    });

  document
    .getElementById("toggleDarkMode")
    .addEventListener("change", function () {
      // Logic to toggle dark mode
    });

  document
    .getElementById("showSavedSearches")
    .addEventListener("click", function () {
      document
        .getElementById("savedSearchesContainer")
        .classList.toggle("hidden");
    });

  document
    .getElementById("settingsButton")
    .addEventListener("click", function () {
      document.getElementById("settingsContainer").classList.toggle("hidden");
    });

  document
    .getElementById("logoutButton")
    .addEventListener("click", function () {
      // Logic to handle logout
    });

  const auth = getAuth();
  const db = getFirestore();
  let settings = {}; // Ensure settings is defined
  const procedureData = {
    // Add your procedure data here
    exampleType: {
      taotlusteAeg: 10,
      pakkumusteAeg: 20,
      useInternational: false,
    },
  }; // Ensure procedureData is defined
  let internationalProcedureData = {}; // Ensure internationalProcedureData is defined
  let resultContainerHTML = ""; // Ensure resultContainerHTML is defined

  // Login function
  window.login = async () => {
    const email = document.getElementById("emailLogin").value;
    const password = document.getElementById("passwordLogin").value;

    if (!email || !password) {
      alert("Palun sisesta e-post ja parool.");
      return;
    }

    try {
      console.log("Attempting to sign in with email:", email);
      await signInWithEmailAndPassword(auth, email, password);
      alert("Sisselogimine õnnestus!");
      window.location.reload(); // ✅ Reload page to update UI
    } catch (error) {
      console.error("Sisselogimine ebaõnnestus:", error);
      alert("Sisselogimine ebaõnnestus: " + error.message);
    }
  };

  // Register function
  window.register = async () => {
    const email = document.getElementById("emailRegister").value;
    const password = document.getElementById("passwordRegister").value;

    if (!email || !password) {
      alert("Palun sisesta e-post ja parool.");
      return;
    }

    try {
      console.log("Attempting to register with email:", email);
      await createUserWithEmailAndPassword(auth, email, password);
      alert("Registreerimine õnnestus!");
      window.location.href = "login.html"; // ✅ Redirect to login page after registration
    } catch (error) {
      console.error("Registreerimine ebaõnnestus:", error);
      alert("Registreerimine ebaõnnestus: " + error.message);
    }
  };

  // Logout function
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      console.log("🔴 Logging out user...");
      await signOut(auth);
      window.location.href = "index.html";
    });
  }

  // Redirect logged-in users to index.html
  onAuthStateChanged(auth, (user) => {
    if (user) {
      console.log("✅ User is already logged in. Redirecting...");
      window.location.href = "index.html";
    }
  });

  // Attach event listeners safely
  function attachEventListener(buttonId, eventHandler) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.addEventListener("click", eventHandler);
    } else {
      console.warn(`⚠️ ${buttonId} not found in DOM.`);
    }
  }

  // Login Button Click Event
  attachEventListener("loginButton", async () => {
    console.log("🟢 Login Button Clicked");
    const email = document.getElementById("emailLogin").value;
    const password = document.getElementById("passwordLogin").value;

    if (!email || !password) {
      alert("Palun sisesta e-post ja parool.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "index.html";
    } catch (error) {
      console.error("❌ Login error:", error);
      alert("Login error: " + error.message);
    }
  });

  // Register Button Click Event
  attachEventListener("registerButton", async () => {
    console.log("🟢 Register Button Clicked");
    const email = document.getElementById("emailRegister").value;
    const password = document.getElementById("passwordRegister").value;

    if (!email || !password) {
      alert("Palun sisesta e-post ja parool.");
      return;
    }

    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      await setDoc(doc(db, "users", user.uid), {
        email: email,
        role: "active",
        approved: false,
      });

      alert("Registreerimine edukas! Oota admini kinnitust.");
      window.location.href = "index.html";
    } catch (error) {
      console.error("❌ Registration error:", error);
      alert("Registration error: " + error.message);
    }
  });

  // Logout Button Click Event
  attachEventListener("logoutButton", async () => {
    console.log("🔴 Logging out user...");
    await signOut(auth);
    window.location.href = "index.html";
  });

  // Load users for admin panel
  async function loadUsers() {
    try {
      console.log("Fetching users from Firestore...");

      const usersCollection = collection(db, "users");
      const userDocs = await getDocs(usersCollection);

      console.log("Firestore Response:", userDocs.docs);

      const userTable = document.getElementById("userTable");
      userTable.innerHTML = ""; // Clear table before loading

      userDocs.forEach((docSnapshot) => {
        const userData = docSnapshot.data();
        console.log("User Loaded:", userData);

        const userRow = document.createElement("tr");
        userRow.innerHTML = `
            <td class="border px-4 py-2">${userData.email}</td>
            <td class="border px-4 py-2">${userData.role}</td>
            <td class="border px-4 py-2">${userData.approved}</td>
            <td class="border px-4 py-2">
              <button class="approve-btn bg-green-500 text-white px-2 py-1 rounded" onclick="approveUser('${docSnapshot.id}')" aria-label="Approve User">Approve</button>
              <button class="delete-btn bg-red-500 text-white px-2 py-1 rounded" onclick="deleteUser('${docSnapshot.id}')" aria-label="Delete User">Delete</button>
            </td>
          `;
        userTable.appendChild(userRow);
      });
    } catch (error) {
      console.error("Error loading users from Firestore:", error);
      alert("Error loading user data. Check Firestore rules.");
    }
  }

  window.approveUser = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { approved: true });

      alert("User approved!");
      loadUsers(); // Refresh user list
    } catch (error) {
      console.error("Error approving user:", error);
      alert("Failed to approve user.");
    }
  };

  window.deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const userRef = doc(db, "users", userId);
      await deleteDoc(userRef);
      alert("User deleted!");
      loadUsers(); // Refresh user list
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Failed to delete user.");
    }
  };

  // Function to logout
  window.logoutAdmin = () => {
    signOut(auth)
      .then(() => {
        alert("Logged out successfully.");
        window.location.href = "/index.html";
      })
      .catch((error) => {
        console.error("Error logging out:", error);
        alert("Logout failed.");
      });
  };

  // Settings button toggle
  const settingsButton = document.getElementById("settingsButton");
  const settingsContainer = document.getElementById("settingsContainer");

  if (settingsButton && settingsContainer) {
    settingsButton.addEventListener("click", () => {
      settingsContainer.classList.toggle("hidden");
    });
  }

  // Save settings
  document
    .getElementById("settingsForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      settings.documentPreparationDays = parseInt(
        document.getElementById("documentPreparationDays").value,
      );
      settings.offerEvaluationDays = parseInt(
        document.getElementById("offerEvaluationDays").value,
      );
      settings.decisionDays = parseInt(
        document.getElementById("decisionDays").value,
      );
      settings.bidderEvaluationDays = parseInt(
        document.getElementById("bidderEvaluationDays").value,
      );
      settings.successfulBidderDays = parseInt(
        document.getElementById("successfulBidderDays").value,
      );
      settings.waitingPeriodDays = parseInt(
        document.getElementById("waitingPeriodDays").value,
      );
    });

  const addProcedureTypeButton = document.getElementById(
    "addProcedureTypeButton",
  );
  if (addProcedureTypeButton) {
    addProcedureTypeButton.addEventListener("click", function () {
      addProcedureType();
    });
  }

  const procedureTypeSelect = document.getElementById("procedureTypeSelect");
  if (procedureTypeSelect) {
    procedureTypeSelect.addEventListener("change", function () {
      const selectedType = this.value;
      loadProcedureTypeSettings(selectedType);
    });
  }

  function loadSettings() {
    document.getElementById("documentPreparationDays").value =
      settings.documentPreparationDays;
    document.getElementById("offerEvaluationDays").value =
      settings.offerEvaluationDays;
    document.getElementById("decisionDays").value = settings.decisionDays;
    document.getElementById("bidderEvaluationDays").value =
      settings.bidderEvaluationDays;
    document.getElementById("successfulBidderDays").value =
      settings.successfulBidderDays;
    document.getElementById("waitingPeriodDays").value =
      settings.waitingPeriodDays;
  }

  function saveSettings() {
    localStorage.setItem("procurementSettings", JSON.stringify(settings));
  }

  function loadSavedSettings() {
    const savedSettings = localStorage.getItem("procurementSettings");
    if (savedSettings) {
      settings = JSON.parse(savedSettings);
    }
  }

  function loadProcedureTypes() {
    const select = document.getElementById("procedureTypeSelect");
    select.innerHTML = "";
    Object.keys(procedureData).forEach((type) => {
      const option = document.createElement("option");
      option.value = type;
      option.textContent = type;
      select.appendChild(option);
    });
    if (select.options.length > 0) {
      loadProcedureTypeSettings(select.options[0].value);
    }
  }

  function loadProcedureTypeSettings(type) {
    const procedure = procedureData[type];
    const container = document.getElementById("procedureTypeSettings");
    container.innerHTML = `
            <div class="procedure-type">
                <label for="procedureTypeName" class="block text-gray-700">Menetlusliik:</label>
                <input type="text" id="procedureTypeName" value="${type}" required><br><br>
                <label for="requestDays" class="block text-gray-700">Taotluste esitamise päevad:</label>
                <input type="number" id="requestDays" value="${procedure.taotlusteAeg}" required><br><br>
                <label for="offerDays" class="block text-gray-700">Pakkumuste esitamise päevad:</label>
                <input type="number" id="offerDays" value="${procedure.pakkumusteAeg}" required><br><br>
                <label for="useInternationalThreshold" class="block text-gray-700">Kasuta rahvusvahelisi tähtaegu:</label>
                <input type="checkbox" id="useInternationalThreshold" ${procedure.useInternational ? "checked" : ""} onchange="toggleInternationalThreshold('${type}')"><br><br>
                <button onclick="deleteProcedureType('${type}')" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition transform hover:scale-105">Kustuta</button>
                <button onclick="saveProcedureType('${type}')" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition transform hover:scale-105">Salvesta</button>
            </div>
            `;
  }

  function addProcedureType() {
    const container = document.getElementById("procedureTypeSettings");
    container.innerHTML = `
            <div class="procedure-type">
                <label for="procedureTypeName" class="block text-gray-700">Menetlusliik:</label>
                <input type="text" id="procedureTypeName" required><br><br>
                <label for="requestDays" class="block text-gray-700">Taotluste esitamise päevad:</label>
                <input type="number" id="requestDays" required><br><br>
                <label for="offerDays" class="block text-gray-700">Pakkumuste esitamise päevad:</label>
                <input type="number" id="offerDays" required><br><br>
                <label for="useInternationalThreshold" class="block text-gray-700">Kasuta rahvusvahelisi tähtaegu:</label>
                <input type="checkbox" id="useInternationalThreshold" onchange="toggleInternationalThreshold()"><br><br>
                <button onclick="saveNewProcedureType()" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition transform hover:scale-105">Salvesta</button>
            </div>
            `;
  }

  function toggleInternationalThreshold(type) {
    const useInternational = document.getElementById(
      "useInternationalThreshold",
    ).checked;
    const procedure = useInternational
      ? internationalProcedureData[type]
      : procedureData[type];
    document.getElementById("requestDays").value = procedure.taotlusteAeg;
    document.getElementById("offerDays").value = procedure.pakkumusteAeg;
  }

  function deleteProcedureType(type) {
    delete procedureData[type];
    loadProcedureTypes();
    saveSettings();
  }

  function saveProcedureType(oldType) {
    const newType = document.getElementById("procedureTypeName").value;
    const requestDays = parseInt(document.getElementById("requestDays").value);
    const offerDays = parseInt(document.getElementById("offerDays").value);
    const useInternational = document.getElementById(
      "useInternationalThreshold",
    ).checked;
    delete procedureData[oldType];
    procedureData[newType] = {
      taotlusteAeg: requestDays,
      pakkumusteAeg: offerDays,
      piirmäär: 60000,
      useInternational,
    }; // Default piirmäär
    loadProcedureTypes();
    saveSettings();
  }

  function saveNewProcedureType() {
    const newType = document.getElementById("procedureTypeName").value;
    const requestDays = parseInt(document.getElementById("requestDays").value);
    const offerDays = parseInt(document.getElementById("offerDays").value);
    const useInternational = document.getElementById(
      "useInternationalThreshold",
    ).checked;
    procedureData[newType] = {
      taotlusteAeg: requestDays,
      pakkumusteAeg: offerDays,
      piirmäär: 60000,
      useInternational,
    }; // Default piirmäär
    loadProcedureTypes();
    saveSettings();
  }

  loadSavedSettings();
  loadSettings();
  loadProcedureTypes();

  async function saveAllSearchesToFirestore() {
    const user = auth.currentUser;
    if (!user) {
      alert("You must be logged in to save searches.");
      return;
    }

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        savedSearches: savedSearches.map((search) => ({
          name: search.name,
          cost: search.cost,
          procedureType: search.procedureType,
          contractSigningDate: search.contractSigningDate,
          requestSubmissionDate: search.requestSubmissionDate,
          procedureDuration: search.procedureDuration,
        })),
      });
      alert("All searches saved to Firestore!");
    } catch (error) {
      console.error("Error saving searches to Firestore:", error);
      alert("Failed to save searches to Firestore.");
    }
  }

  document
    .getElementById("saveToFirestore")
    .addEventListener("click", saveAllSearchesToFirestore);
});

class PublicProcurement {
  constructor(name, cost, procedureType, contractSigningDate) {
    // Ensure the date is valid before any conversion logic
    if (
      !contractSigningDate ||
      isNaN(new Date(contractSigningDate).getTime())
    ) {
      console.error("Invalid contract signing date:", contractSigningDate);
      this.contractSigningDate = null; // Avoid breaking further calculations
    } else {
      // Convert dd.mm.yyyy to YYYY-MM-DD if necessary
      if (
        typeof contractSigningDate === "string" &&
        contractSigningDate.includes(".")
      ) {
        const parts = contractSigningDate.split(".");
        if (parts.length === 3) {
          contractSigningDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }
      this.contractSigningDate = new Date(contractSigningDate);
    }

    this.name = name;
    this.cost = cost;
    this.procedureType = procedureType;
    this.contractSigningDate = new Date(contractSigningDate);
    null;
    this.procedureDuration = this.calculateProcedureDuration();
    this.procedureDetails = this.calculateProcedureDetails();
    this.requestSubmissionDate = this.calculateRequestSubmissionDate();
  }

  calculateProcedureDuration() {
    const procedure = this.procedureType[this.procedureType];
    const internationalProcedure =
      this.internationalProcedureType[this.procedureType];
    const internationalThreshold = internationalProcedure.piirmäär;

    let duration = 0;

    if (this.cost > internationalThreshold || procedure.useInternational) {
      duration +=
        internationalProcedure.taotlusteAeg +
        internationalProcedure.pakkumusteAeg;
    } else {
      duration += procedure.taotlusteAeg + procedure.pakkumusteAeg;
    }

    duration += settings.documentPreparationDays;
    duration += settings.offerEvaluationDays;
    duration += settings.decisionDays;
    duration += settings.bidderEvaluationDays;
    duration += settings.successfulBidderDays;
    duration += settings.waitingPeriodDays;

    return duration;
  }

  calculateProcedureDetails() {
    const procedure = procedureData[this.procedureType];
    const internationalProcedure =
      internationalProcedureData[this.procedureType];
    const internationalThreshold = internationalProcedure.piirmäär;
    let taotlusteAeg, pakkumusteAeg;

    if (this.cost > internationalThreshold || procedure.useInternational) {
      taotlusteAeg = internationalProcedure.taotlusteAeg;
      pakkumusteAeg = internationalProcedure.pakkumusteAeg;
    } else {
      taotlusteAeg = procedure.taotlusteAeg;
      pakkumusteAeg = procedure.pakkumusteAeg;
    }

    const details = [
      {
        step: "Riigihanke alusdokumentide koostamine",
        days: ` ${settings.documentPreparationDays} päeva`,
      },
      {
        step: "Taotluste esitamine RHRis",
        days: taotlusteAeg ? `${taotlusteAeg} päeva` : "Ei kohaldu",
      },
      {
        step: "Pakkumuste esitamine RHRis",
        days: pakkumusteAeg ? `${pakkumusteAeg} päeva` : "Ei kohaldu",
      },
      { step: "Hindamine 1", days: `${settings.offerEvaluationDays} päeva` },
      { step: "Otsus 1", days: `${settings.decisionDays} päeva` },
      { step: "Hindamine 2", days: `${settings.bidderEvaluationDays} päeva` },
      { step: "Otsus 2", days: `${settings.successfulBidderDays} päeva` },
      { step: "Ooteaeg", days: `${settings.waitingPeriodDays} päeva` },
    ];
    return details;
  }

  calculateRequestSubmissionDate() {
    // Step 1: Ensure contractSigningDate is in YYYY-MM-DD format
    if (
      typeof this.contractSigningDate === "string" &&
      this.contractSigningDate.includes(".")
    ) {
      const parts = this.contractSigningDate.split(".");
      if (parts.length === 3) {
        this.contractSigningDate =
          typeof this.contractSigningDate === "string"
            ? `${parts[2]}-${parts[1]}-${parts[0]}`
            : this.contractSigningDate; // Convert dd.mm.yyyy → YYYY-MM-DD only if it's a string
      }
    }

    // Step 2: Validate contractSigningDate before using it
    if (
      !this.contractSigningDate ||
      isNaN(new Date(this.contractSigningDate).getTime())
    ) {
      console.error("Invalid contract signing date:", this.contractSigningDate);
      return "Invalid date"; // Prevent further errors
    }

    // Step 3: Calculate the request submission date
    const submissionDate = new Date(this.contractSigningDate);
    if (!isNaN(this.procedureDuration)) {
      submissionDate.setDate(submissionDate.getDate() - this.procedureDuration);
      if (isNaN(submissionDate.getTime())) {
        console.error("Invalid submission date:", submissionDate);
        return "Invalid date"; // Prevents errors
      }
      return submissionDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
      console.error("Invalid procedure duration:", this.procedureDuration);
    }

    // Step 4: Calculate expected quarter
    const month = submissionDate.getMonth() + 1;
    const year = submissionDate.getFullYear();
    this.expectedQuarter = `Q${Math.ceil(month / 3)} ${year}`;

    return submissionDate.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
  }

  generateHTML() {
    const detailsHTML = this.procedureDetails
      .map(
        (detail, index) => `
                    <li class="flex flex-col py-2 border-b">
                        <div class="flex justify-between items-center">
                            <span class="w-3/4">${detail.step}:</span>
                            <span id="days-${index}" class="w-16 text-center font-medium whitespace-nowrap">${detail.days}</span>
                            <div class="flex gap-1 ml-6">
                                <button onclick="adjustDays(${index}, -1)" class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition transform hover:scale-105">-</button>
                                <button onclick="adjustDays(${index}, 1)" class="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600 transition transform hover:scale-105">+</button>
                            </div>
                        </div>
                            <div class="w-full bg-gray-200 rounded-full h-4 overflow-hidden mt-1">
                            <div id="progress-${index}" class="progress-bar bg-blue-500 h-4 rounded-full transition-all duration-500" data-progress="0"></div>
                        </div>
                    </li>
                `,
      )
      .join("");

    const errorMessage =
      new Date(this.requestSubmissionDate) < new Date()
        ? '<p class="error-message text-red-500 font-bold">NB! Oled hiljaks jäänud, palun tutvu menetlusele kuluva ajaga ja korrigeeri lepingu sõlmimise kuupäeva</p>'
        : "";

    return `
                    <div class="result-card bg-white p-6 rounded max-w-lg">
                        <h2 class="text-2xl font-bold text-black-500 mb-4">Riigihanke andmed</h2>
                        <p><strong>Riigihanke taotluse esitamise kuupäev:</strong> 
                            <span id="requestSubmissionDate">${formatDate(this.requestSubmissionDate)}</span>
                        </p>
                        ${errorMessage}
                        <p><strong>Nimi:</strong> ${this.name}</p>
                        <p><strong>Maksumus:</strong> ${this.cost}</p>
                        <p><strong>Riigihanke menetlusliik:</strong> ${this.procedureType}</p>
                        <p><strong>Lepingu allkirjastamise kuupäev:</strong> ${formatDate(this.contractSigningDate)}</p>

                        <p><strong>Eeldatav riigihanke menetlusaeg päevades:</strong> <span id="totalDuration">${this.procedureDuration}</span> päeva</p>

                        <ul class="list-none p-0">
                            ${detailsHTML}
                        </ul>
                    </div>
                `;
  }

  generateTableRow(index) {
    return `
                    <tr>
                        <td class="border p-2">${this.name}</td>
                        <td class="border p-2">${this.procedureType}</td>
                        <td class="border p-2">${this.expectedQuarter}</td>
                        <td class="border p-2">${this.cost}</td>
                        <td class="border p-2">${this.procedureDuration} päeva</td>
                        <td class="border p-2">${formatDate(this.requestSubmissionDate)}</td>
                        <td class="border p-2">${formatDate(this.contractSigningDate)}</td>
                        <td class="border p-2"><button class="edit-button bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition transform hover:scale-105" onclick="editSearch(${index})">Muuda</button></td>
                        <td class="border p-2"><button class="delete-button bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition transform hover:scale-105" onclick="deleteSearch(${index})">Kustuta</button></td>
                    </tr>
                `;
  }
}

function adjustDays(index, adjustment) {
  const daysElement = document.getElementById(`days-${index}`);
  if (!daysElement) {
    console.error(`Element with id days-${index} not found`);
    return;
  }

  let daysText = daysElement.innerText;
  let days = parseInt(daysText.match(/\d+/)?.[0] || "0", 10); // Avoid NaN
  days += adjustment;
  daysElement.innerText = daysText.replace(/\d+/, days);

  // Update total duration
  const totalDurationElement = document.getElementById("totalDuration");
  if (totalDurationElement) {
    let totalDuration = parseInt(totalDurationElement.innerText || "0", 10);
    totalDuration += adjustment;
    totalDurationElement.innerText = totalDuration;
  } else {
    console.error("Element with id totalDuration not found");
  }

  // Store updated total duration in the PublicProcurement object
  const procurement = savedSearches.find(
    (p) => p.name === document.getElementById("name").value,
  );
  if (procurement) {
    procurement.procedureDuration = parseInt(
      document.getElementById("totalDuration").innerText,
    );
    procurement.requestSubmissionDate =
      procurement.calculateRequestSubmissionDate();
    document.getElementById("requestSubmissionDate").innerText = formatDate(
      procurement.requestSubmissionDate,
    );
  } else {
    console.error("Could not find procurement object for real-time update.");
  }
}

const savedSearches = [];
const history = [];

document
  .getElementById("procurementForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const cost = parseFloat(document.getElementById("cost").value);
    const procedureType = document.getElementById("procedureType").value;
    const contractSigningDate = document.getElementById(
      "contractSigningDate",
    ).value;

    const procurement = new PublicProcurement(
      name,
      cost,
      procedureType,
      contractSigningDate,
    );
    document.getElementById("result").innerHTML = procurement.generateHTML(); // Ensure the result is // Lisa puuduolev progressiribade uuendus

    function extractStepDays() {
      return Array.from(document.querySelectorAll('[id^="days-"]')).map(
        (el, index) => {
          let daysText = el.innerText;
          let days = parseInt(daysText.match(/\d+/)?.[0] || "0", 10);
          return { index, element: el, days };
        },
      );
    }

    function updateTotalDuration() {
      const totalDurationElement = document.getElementById("totalDuration");
      if (!totalDurationElement) return;

      const totalDays = extractStepDays().reduce(
        (sum, step) => sum + step.days,
        0,
      );
      totalDurationElement.innerText = totalDays;

      updateProgressBars();
    }

    function updateProgressBars() {
      const stepData = extractStepDays();
      const totalDurationElement = document.getElementById("totalDuration");
      const totalDuration = parseInt(totalDurationElement?.innerText, 10) || 1; // Get total duration

      stepData.forEach((step) => {
        const progressBar = document.getElementById(`progress-${step.index}`);
        if (progressBar) {
          // Hide the progress bar if "Ei kohaldu"
          if (step.element.innerText.includes("Ei kohaldu")) {
            progressBar.style.display = "none";
            return;
          } else {
            progressBar.style.display = "block";
          }

          // Scale width dynamically based on the total duration
          let progressWidth = (step.days / totalDuration) * 100 * 1.25;
          progressBar.dataset.progress = progressWidth.toFixed(2);

          // 🚀 FORCE width and color immediately before animation
          progressBar.style.width = `${progressWidth}%`;

          // Apply colors dynamically based on percentage of total duration
          progressBar.classList.remove(
            "bg-blue-500",
            "bg-green-500",
            "bg-yellow-500",
            "bg-red-500",
          );
          if (progressWidth >= 25) {
            progressBar.classList.add("bg-red-500"); // Very long duration
          } else if (progressWidth >= 14) {
            progressBar.classList.add("bg-yellow-500"); // Medium duration
          } else {
            progressBar.classList.add("bg-green-500"); // Short duration
          }
          setTimeout(() => {
            gsap.to(progressBar, {
              width: `${progressWidth}%`,
              duration: 0.8,
              ease: "power2.out",
            });
          }, 10); // Small delay ensures colors are visible first
        }
      });
    }

    setTimeout(() => {
      updateTotalDuration();
      updateProgressBars();
    }, 100);

    // Show the result container
    document.getElementById("resultContainer").classList.remove("hidden");

    if (savedSearches.length < 15) {
      savedSearches.push(procurement);
      updateSavedSearchesTable();
    } else {
      alert("Maksimaalne salvestatud otsingute arv on 15.");
    }
  });

document.getElementById("clearFields").addEventListener("click", function () {
  document.getElementById("procurementForm").reset();
  document.getElementById("result").innerHTML = "";
  document.getElementById("resultContainer").classList.add("hidden"); // Hide the result container
});

document.getElementById("saveFields").addEventListener("click", function () {
  const name = document.getElementById("name").value;
  const cost = parseFloat(document.getElementById("cost").value);
  const procedureType = document.getElementById("procedureType").value;
  const contractSigningDate = document.getElementById(
    "contractSigningDate",
  ).value;

  const procurement = new PublicProcurement(
    name,
    cost,
    procedureType,
    contractSigningDate,
  );

  // Update procedure details with adjusted days
  procurement.procedureDetails.forEach((detail, index) => {
    const daysElement = document.getElementById(`days-${index}`);
    if (daysElement) {
      let daysText = daysElement.innerText;
      let match = daysText.match(/\d+/);
      if (match) {
        let days = parseInt(match[0]);
        detail.days = `${days} päeva`;
      } else {
        console.error("No days found in text:", daysText);
      }
    } else {
      console.error("Element not found for index:", index);
    }
  });

  // Capture the adjusted procedureDuration value
  const totalDurationElement = document.getElementById("totalDuration");
  if (totalDurationElement) {
    procurement.procedureDuration = parseInt(totalDurationElement.innerText);
  } else {
    console.error("Total duration element not found");
  }

  procurement.requestSubmissionDate =
    procurement.calculateRequestSubmissionDate();

  // Update the displayed result
  document.getElementById("result").innerHTML = procurement.generateHTML();

  // Save the updated procurement
  const existingIndex = savedSearches.findIndex((p) => p.name === name);
  if (existingIndex !== -1) {
    savedSearches[existingIndex] = procurement;
  } else {
    if (savedSearches.length < 15) {
      savedSearches.push(procurement);
    } else {
      alert("Maksimaalne salvestatud otsingute arv on 15.");
    }
  }

  // Save to history
  if (history.length >= 500) {
    history.shift(); // Remove the oldest entry if history exceeds 500
  }
  history.push(procurement);
  saveHistory(); // Save history immediately
});

document.getElementById("refreshFields").addEventListener("click", function () {
  const procurement = new PublicProcurement(
    document.getElementById("name").value,
    parseFloat(document.getElementById("cost").value),
    document.getElementById("procedureType").value,
    document.getElementById("contractSigningDate").value,
  );

  procurement.procedureDuration = parseInt(
    document.getElementById("totalDuration").innerText,
  );
  procurement.requestSubmissionDate =
    procurement.calculateRequestSubmissionDate();
  document.getElementById("requestSubmissionDate").innerText = formatDate(
    procurement.requestSubmissionDate,
  );
  updateSavedSearchesTable();
});

document.getElementById("saveToExcel").addEventListener("click", function () {
  if (savedSearches.length === 0) {
    alert("Salvestatud otsinguid ei ole.");
    return;
  }

  // Define column headers
  const headers = [
    "Riigihanke Eseme Nimetus",
    "Riigihanke Menetluse Liik",
    "Riigihanke Korraldamise Eeldatav Aeg",
    "Riigihanke Eeldatav Maksumus (ilma KM-ta)",
    "Sõlmitava Lepingu Kehtivusaeg",
    "Riigihanke Eest Vastutav Isik",
    "Tehnilise Kirjelduse Eest Vastutav Isik",
  ];

  // Prepare data rows
  const data = savedSearches.map((procurement) => [
    procurement.name || "",
    procurement.procedureType || "",
    getQuarter(procurement.requestSubmissionDate || "Määramata"),
    procurement.cost || "",
    "", // Empty field for contract duration
    "", // Empty field for responsible person
    "", // Empty field for technical responsible person
  ]);

  // Combine headers and data
  const worksheetData = [headers, ...data];

  // Create a new workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(worksheetData);

  // Auto-width for columns
  ws["!cols"] = headers.map(() => ({ wch: 25 }));

  // Apply table formatting
  const range = XLSX.utils.decode_range(ws["!ref"]);
  ws["!autofilter"] = { ref: XLSX.utils.encode_range(range) };

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Hankeplaan");

  // Export to .xlsx file
  XLSX.writeFile(wb, "hankeplaan.xlsx");
});

const getQuarter = (dateString) => {
  if (!dateString || dateString === "Määramata") return "Määramata"; // If no date, return "Määramata"

  const dateParts = dateString.split(".");
  if (dateParts.length !== 3) return "Määramata"; // Expecting "dd.mm.yyyy" format

  const month = parseInt(dateParts[1], 10);
  const year = dateParts[2];

  if (month >= 1 && month <= 3) return `1. kvartal ${year}`;
  if (month >= 4 && month <= 6) return `2. kvartal ${year}`;
  if (month >= 7 && month <= 9) return `3. kvartal ${year}`;
  if (month >= 10 && month <= 12) return `4. kvartal ${year}`;

  return "Määramata"; // Ensure a valid return value
};

document.getElementById("showForm").addEventListener("click", function () {
  closeAllTabs();
  document.getElementById("formContainer").classList.remove("hidden");
  if (resultContainerHTML) {
    document.getElementById("resultContainer").innerHTML = resultContainerHTML;
    document.getElementById("resultContainer").classList.remove("hidden");
  }
  setActiveTab(this);
});

document
  .getElementById("showSavedSearches")
  .addEventListener("click", function () {
    saveResultContainerHTML();
    closeAllTabs();
    document
      .getElementById("savedSearchesContainer")
      .classList.remove("hidden");
    updateSavedSearchesTable();
    setActiveTab(this);
  });

document
  .getElementById("settingsButton")
  .addEventListener("click", function () {
    saveResultContainerHTML();
    closeAllTabs();
    document.getElementById("settingsContainer").classList.remove("hidden");
    loadSettings();
    loadProcedureTypes();
    setActiveTab(this);
  });

function setActiveTab(button) {
  const navButtons = document.querySelectorAll(".nav button");
  navButtons.forEach((btn) => btn.classList.remove("active"));
  button.classList.add("active");
}

function saveResultContainerHTML() {
  resultContainerHTML = document.getElementById("resultContainer").innerHTML;
}

function closeAllTabs() {
  document.getElementById("formContainer").classList.add("hidden");
  document.getElementById("savedSearchesContainer").classList.add("hidden");
  document.getElementById("settingsContainer").classList.add("hidden");
  document.getElementById("resultContainer").classList.add("hidden");
}

function updateSavedSearchesTable() {
  const tableBody = document.getElementById("savedSearchesTableBody");

  tableBody.innerHTML = ""; // Clear previous entries

  savedSearches.forEach((search, index) => {
    const row = `
                <tr class="border-b even:bg-gray-100 hover:bg-gray-200 transition-all">
                <td class="p-4 font-semibold text-gray-800">${search.name}</td>
                <td class="p-4 text-gray-700">${search.procedureType}</td>
                <td class="p-4 text-green-600 font-semibold">${search.cost} €</td>
                <td class="p-4 text-blue-600 font-semibold">${search.procedureDuration} päeva</td>
                <td class="p-4 text-gray-500">${formatDate(search.requestSubmissionDate)}</td>
                <td class="p-4 text-gray-500">${formatDate(search.contractSigningDate)}</td>
                <td class="p-4 text-center">
                    <button onclick="editSearch(${index})" class="bg-yellow-500 text-white px-3 py-1 rounded-lg hover:bg-yellow-600 transition transform hover:scale-105">
                    ✏️ Muuda
                    </button>
                </td>
                <td class="p-4 text-center">
                    <button onclick="deleteSearch(${index})" class="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition transform hover:scale-105">
                    ❌ Kustuta
                    </button>
                </td>
                </tr>
            `;
    tableBody.innerHTML += row;
  });
}
function deleteSearch(index) {
  savedSearches.splice(index, 1);
  updateSavedSearchesTable();
}

function editSearch(index) {
  const procurement = savedSearches[index];
  document.getElementById("name").value = procurement.name;
  document.getElementById("cost").value = procurement.cost;
  document.getElementById("procedureType").value = procurement.procedureType;
  document.getElementById("contractSigningDate").value =
    procurement.contractSigningDate.toISOString().split("T")[0];
  deleteSearch(index);
  closeAllTabs();
  document.getElementById("formContainer").classList.remove("hidden");
  setActiveTab(document.getElementById("showForm"));
}

function refreshDuration(index) {
  const procurement = savedSearches[index];
  procurement.procedureDuration = parseInt(
    document.getElementById("totalDuration").innerText,
  );
  procurement.requestSubmissionDate =
    procurement.calculateRequestSubmissionDate();
  document.getElementById("requestSubmissionDate").innerText = formatDate(
    procurement.requestSubmissionDate,
  );
  updateSavedSearchesTable();
}

function updateHistoryTable() {
  const tableBody = document.getElementById("historyTableBody");
  tableBody.innerHTML = "";
  history.forEach((procurement, index) => {
    console.log("Adding row for:", procurement); // Debugging statement
    tableBody.innerHTML += procurement.generateTableRow(index);
  });
  populateFilterOptions();
}

function populateFilterOptions() {
  const filterSelect = document.getElementById("filterByDate");
  const dates = [
    ...new Set(
      history.map(
        (procurement) =>
          procurement.contractSigningDate.toISOString().split("T")[0],
      ),
    ),
  ];
  filterSelect.innerHTML = '<option value="all">Kõik</option>';
  dates.forEach((date) => {
    filterSelect.innerHTML += `<option value="${date}">${date}</option>`;
  });
}

document.getElementById("filterByDate").addEventListener("change", function () {
  const selectedDate = this.value;
  const filteredHistory =
    selectedDate === "all"
      ? history
      : history.filter(
          (procurement) =>
            procurement.contractSigningDate.toISOString().split("T")[0] ===
            selectedDate,
        );
  const tableBody = document.getElementById("historyTableBody");
  tableBody.innerHTML = "";
  filteredHistory.forEach((procurement, index) => {
    tableBody.innerHTML += procurement.generateTableRow(index);
  });

  document
    .getElementById("toggleDarkMode")
    .addEventListener("click", function () {
      document.body.classList.toggle("bg-gray-900");
      document.body.classList.toggle("text-white");
    });

  function adjustTableColumns() {
    const tables = document.querySelectorAll("table");
    tables.forEach((table) => {
      const columns = table.querySelectorAll("th");
      columns.forEach((column, index) => {
        let maxWidth = 0;
        const cells = table.querySelectorAll(`td:nth-child(${index + 1})`);
        cells.forEach((cell) => {
          const cellWidth = cell.offsetWidth;
          if (cellWidth > maxWidth) {
            maxWidth = cellWidth;
          }
        });
        column.style.width = `${maxWidth}px`;
      });
    });
  }

  document
    .getElementById("dropdownButton")
    .addEventListener("click", function () {
      const dropdownMenu = document.getElementById("dropdownMenu");
      dropdownMenu.classList.toggle("hidden");
    });

  document.addEventListener("click", function (event) {
    const dropdownButton = document.getElementById("dropdownButton");
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (!dropdownButton.contains(event.target)) {
      dropdownMenu.classList.add("hidden");
    }
  });

  // Dark Mode Toggle
  const darkModeToggle = document.getElementById("toggleDarkMode");
  darkModeToggle.addEventListener("change", () => {
    document.body.classList.toggle("bg-gray-900");
    document.body.classList.toggle("text-white");

    // Navbar, header, and tab menu
    // Fix navbar & header gradient
    const header = document.querySelector("header");
    if (darkModeToggle.checked) {
      header.classList.remove(
        "bg-gradient-to-r",
        "from-blue-500",
        "to-indigo-600",
      );
      header.classList.add("bg-gray-800");
    } else {
      header.classList.remove("bg-gray-800");
      header.classList.add(
        "bg-gradient-to-r",
        "from-blue-500",
        "to-indigo-600",
      );
    }

    // Ensure navbar links stay visible
    document.querySelectorAll("nav a").forEach((el) => {
      el.classList.toggle("text-gray-300");
      el.classList.toggle("text-white");
    });

    document.querySelectorAll("header, nav, .tab-content").forEach((el) => {
      el.classList.toggle("bg-gray-800");
      el.classList.toggle("text-white");
    });

    // Containers & content boxes
    document
      .querySelectorAll(
        ".container, .shadow, .rounded-lg, .bg-white, .bg-gray-100, .bg-gray-50",
      )
      .forEach((el) => {
        el.classList.toggle("bg-gray-800");
        el.classList.toggle("text-gray-200");
      });

    // Tables
    document.querySelectorAll("table").forEach((el) => {
      el.classList.toggle("bg-gray-700");
      el.classList.toggle("text-gray-300");
    });

    // Table headers
    document.querySelectorAll("thead tr").forEach((el) => {
      el.classList.toggle("bg-gray-600");
    });

    // Buttons
    document.querySelectorAll("button").forEach((el) => {
      el.classList.toggle("shadow-lg");
      el.classList.toggle("border-gray-700");
    });

    // Form Inputs & Select Boxes
    document.querySelectorAll("input, select, textarea").forEach((el) => {
      el.classList.toggle("bg-gray-700");
      el.classList.toggle("text-white");
      el.classList.toggle("border-gray-600");
    });

    // Save dark mode preference in localStorage
    if (document.body.classList.contains("bg-gray-900")) {
      localStorage.setItem("darkMode", "enabled");
    } else {
      localStorage.setItem("darkMode", "disabled");
    }
  });

  // Show Notification
  function showNotification(message, duration = 3000) {
    const notification = document.getElementById("notification");
    notification.textContent = message;
    notification.classList.remove("hidden");
    setTimeout(() => {
      notification.classList.add("hidden");
    }, duration);
  }

  document.getElementById("saveFields").addEventListener("click", function () {
    // Your save logic here
    showNotification("Salvestatud edukalt!");
  });

  document
    .getElementById("refreshFields")
    .addEventListener("click", function () {
      // Your update logic here
      showNotification("Uuendatud edukalt!");
    });

  function toggleChart() {
    const chartContainer = document.getElementById("chartContainer");
    chartContainer.classList.toggle("hidden");

    // Ensure table has data before rendering
    if (!chartContainer.classList.contains("hidden")) {
      setTimeout(() => {
        if (
          document.querySelectorAll("#savedSearchesTableBody tr").length > 0
        ) {
          renderChart();
        } else {
          console.warn(
            "⚠ No saved searches found, chart cannot be displayed.",
          );
        }
      }, 300);
    }
  }

  function renderChart() {
    const canvas = document.getElementById("procurementChart");
    if (!canvas) {
      console.error("❌ Chart canvas not found!");
      return;
    }

    const ctx = canvas.getContext("2d");

    // Destroy previous chart if it exists
    if (
      window.procurementChart &&
      typeof window.procurementChart.destroy === "function"
    ) {
      window.procurementChart.destroy();
    }

    // Extract data from savedSearchesTableBody
    const rows = document.querySelectorAll("#savedSearchesTableBody tr");
    const labels = [];
    const costs = [];
    const totalDays = [];

    rows.forEach((row) => {
      const columns = row.querySelectorAll("td");
      if (columns.length >= 5) {
        // Ensure there are enough columns
        const name = columns[0].innerText.trim();
        const cost = parseFloat(columns[2].innerText.replace("€", "").trim()); // Remove € sign
        const days = parseInt(columns[3].innerText.trim(), 10); // Convert to integer

        if (!isNaN(cost) && !isNaN(days)) {
          // Ensure valid data
          labels.push(name);
          costs.push(cost);
          totalDays.push(days);
        }
      }
    });

    // If no valid data, show a warning and prevent chart initialization
    if (labels.length === 0) {
      console.warn("⚠ No valid data found for the chart.");
      return;
    }

    // Create the chart
    window.procurementChart = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Menetlusaeg (päevad)",
            data: totalDays.map((days) => {
              const today = new Date();
              const submissionDate = new Date();
              submissionDate.setDate(today.getDate() + days);
              const timeDiff = submissionDate.getTime() - today.getTime();
              return Math.ceil(timeDiff / (1000 * 3600 * 24));
            }),
            backgroundColor: "rgba(153, 102, 255, 0.6)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { beginAtZero: true },
        },
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true },
        },
      },
    });
  }

  // Attach event listeners to navbar buttons
  document.addEventListener("DOMContentLoaded", function () {
    const navTool = document.getElementById("showForm");
    const navHanked = document.getElementById("showSavedSearches");
    const navHistory = document.getElementById("showHistory");
    const navSettings = document.getElementById("settingsButton");

    if (navTool)
      navTool.addEventListener("click", () => showTab("formContainer"));
    if (navHanked)
      navHanked.addEventListener("click", () =>
        showTab("savedSearchesContainer"),
      );
    if (navHistory)
      navHistory.addEventListener("click", () => showTab("historyContainer"));
    function showTab(tabId) {
      closeAllTabs();
      document.getElementById(tabId).classList.remove("hidden");
    }
    // Initialize Chart.js
    renderChart();
  });
  function toggleDashboard() {
    const dashboard = document.getElementById("dashboard");
    const recentCalculationsTable = document.getElementById(
      "recentCalculationsTable",
    );
    dashboard.classList.toggle("hidden");
    recentCalculationsTable.classList.toggle("hidden");
  }

  // Ensure the container fades in on page load
  document.addEventListener("DOMContentLoaded", () => {
    gsap.from("body", { opacity: 0, duration: 0.3 });
    updateTotalDuration(); // Ensure total duration is calculated and progress bars are updated on load
  });

  function updateProgressBars() {
    const stepData = extractStepDays();
    const totalDurationElement = document.getElementById("totalDuration");
    const totalDuration = parseInt(totalDurationElement?.innerText, 10) || 1; // Get total durationtotal duration

    stepData.forEach((step) => {
      const progressBar = document.getElementById(`progress-${step.index}`);
      if (progressBar) {
        // Hide the progress bar if "Ei kohaldu"
        if (step.element.innerText.includes("Ei kohaldu")) {
          progressBar.style.display = "none";
          return;
        } else {
          progressBar.style.display = "block";
        }

        // Scale width dynamically based on the total duration
        let progressWidth = (step.days / totalDuration) * 100 * 1.25;
        progressBar.dataset.progress = progressWidth.toFixed(2);

        // 🚀 FORCE width and color immediately before animation
        progressBar.style.width = `${progressWidth}%`;

        // Apply colors dynamically based on percentage of total duration
        progressBar.classList.remove(
          "bg-blue-500",
          "bg-green-500",
          "bg-yellow-500",
          "bg-red-500",
        );
        if (progressWidth >= 25) {
          progressBar.classList.add("bg-red-500"); // Very long duration
        } else if (progressWidth >= 14) {
          progressBar.classList.add("bg-yellow-500"); // Medium duration
        } else {
          progressBar.classList.add("bg-green-500"); // Short duration
        }
        setTimeout(() => {
          gsap.to(progressBar, {
            width: `${progressWidth}%`,
            duration: 0.8,
            ease: "power2.out",
          });
        }, 10); // Small delay ensures colors are visible first
      }
    });
  }

  function extractStepDays() {
    return Array.from(document.querySelectorAll('[id^="days-"]')).map(
      (el, index) => {
        let daysText = el.innerText;
        let days = parseInt(daysText.match(/\d+/)?.[0] || "0", 10);
        return { index, element: el, days };
      },
    );
  }

  function updateTotalDuration() {
    const totalDurationElement = document.getElementById("totalDuration");
    if (!totalDurationElement) return;

    const totalDays = extractStepDays().reduce(
      (sum, step) => sum + step.days,
      0,
    );
    totalDurationElement.innerText = totalDays;

    updateProgressBars();
  }

  function adjustDays(index, adjustment) {
    const stepData = extractStepDays().find((step) => step.index === index);
    if (!stepData) return;

    let newDays = Math.max(0, stepData.days + adjustment);
    stepData.element.innerText = `${newDays} päeva`;

    updateTotalDuration(); // Update total duration
    updateProgressBars(); // Update progress bars dynamically

    // Update the request submission date
    const procurement = savedSearches.find(
      (p) => p.name === document.getElementById("name").value,
    );
    if (procurement) {
      procurement.procedureDuration = parseInt(
        document.getElementById("totalDuration").innerText,
      );
      procurement.requestSubmissionDate =
        procurement.calculateRequestSubmissionDate();
      document.getElementById("requestSubmissionDate").innerText = formatDate(
        procurement.requestSubmissionDate,
      );
    } else {
      console.error("Could not find procurement object for real-time update.");
    }
  }

  function initializeAdjustButtons() {
    document.querySelectorAll("button[data-adjust]").forEach((button) => {
      button.addEventListener("click", function () {
        const index = parseInt(this.dataset.index, 10);
        const adjustment = parseInt(this.dataset.adjust, 10);
        adjustDays(index, adjustment);
      });
    });
  }

  document.addEventListener("readystatechange", function () {
    if (document.readyState === "complete") {
      console.log("Page fully loaded. Initializing scripts...");
      initializeAdjustButtons();
      updateTotalDuration(); // 🔥 Ensures total duration starts correctly
      updateProgressBars(); // 🔥 Ensures progress bars scale correctly on load
    }
  });
  // Active Tab Highlighting
  document.addEventListener("DOMContentLoaded", function () {
    const navLinks = document.querySelectorAll(".nav-link");

    function setActiveTab(event) {
      navLinks.forEach((link) =>
        link.classList.remove("border-b-2", "border-white"),
      );
      event.target.classList.add("border-b-2", "border-white");
    }

    navLinks.forEach((link) => {
      link.addEventListener("click", setActiveTab);
    });
  });

  //menetlusliigi nimi
  document.addEventListener("DOMContentLoaded", function () {
    const procedureSelect = document.getElementById("procedureType");
    const procedureLabel = document.getElementById("procedureLabel");

    function updateProcedureLabel() {
      const selectedOption =
        procedureSelect.options[procedureSelect.selectedIndex];
      const optgroup = selectedOption.closest("optgroup"); // Find parent optgroup

      if (optgroup) {
        procedureLabel.innerText = `${optgroup.label}`;

        // Animate fade-in effect
        gsap.to(procedureLabel, {
          opacity: 1,
          y: 5,
          duration: 0.5,
          ease: "power2.out",
        });
      } else {
        gsap.to(procedureLabel, { opacity: 0, duration: 0.3 });
      }
    }

    // Update on selection change
    procedureSelect.addEventListener("change", updateProcedureLabel);

    // Run once on page load to show the initially selected value
    updateProcedureLabel();
  });

  document.addEventListener("DOMContentLoaded", function () {
    function animateProgressBars() {
      document.querySelectorAll(".progress-bar").forEach((bar) => {
        gsap.to(bar, {
          width: bar.dataset.progress + "%",
          duration: 1.5,
          ease: "power2.out",
        });
      });
    }

    function extractStepDays() {
      return Array.from(document.querySelectorAll('[id^="days-"]')).map(
        (el, index) => {
          let daysText = el.innerText;
          let days = parseInt(daysText.match(/\d+/)?.[0] || "0", 10);
          return { index, element: el, days };
        },
      );
    }
    function updateTotalDuration() {
      const totalDurationElement = document.getElementById("totalDuration");
      if (!totalDurationElement) return;

      const totalDays = extractStepDays().reduce(
        (sum, step) => sum + step.days,
        0,
      );
      totalDurationElement.innerText = totalDays;

      updateProgressBars();
    }

    function adjustDays(index, adjustment) {
      const stepData = extractStepDays().find((step) => step.index === index);
      if (!stepData) return;

      let newDays = Math.max(0, stepData.days + adjustment);
      stepData.element.innerText = `${newDays} päeva`;

      updateTotalDuration(); // Update total duration
      updateProgressBars(); // Update progress bars dynamically
    }

    function initializeAdjustButtons() {
      document.querySelectorAll("button[data-adjust]").forEach((button) => {
        button.addEventListener("click", function () {
          const index = parseInt(this.dataset.index, 10);
          const adjustment = parseInt(this.dataset.adjust, 10);
          adjustDays(index, adjustment);
        });
      });
    }

    document.addEventListener("readystatechange", function () {
      if (document.readyState === "complete") {
        console.log("Page fully loaded. Initializing scripts...");
        initializeAdjustButtons();
        updateTotalDuration(); // 🔥 Ensures total duration starts correctly
        updateProgressBars(); // 🔥 Ensures progress bars scale correctly on load
        setTimeout(updateProgressBars, 500); // 🔥 Second pass to ensure visibility
      }

      document.addEventListener("DOMContentLoaded", () => {
        const settingsButton = document.getElementById("settingsButton");
        const settingsContainer = document.getElementById("settingsContainer");

        // ✅ Fix: Ensure elements exist before adding event listeners
        if (!settingsButton || !settingsContainer) {
          console.error(
            "❌ settingsButton or settingsContainer not found in the DOM!",
          );
          return;
        }

        settingsButton.addEventListener("click", () => {
          settingsContainer.classList.toggle("hidden");
        });
      });
    });
  });
});

function formatDate(date) {
  if (!date) return "Määramata";
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, "0")}.${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}.${d.getFullYear()}`;
}

function saveHistory() {
  localStorage.setItem("procurementHistory", JSON.stringify(history));
}
