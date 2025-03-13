import { db } from "./firebase-config.js";
import { collection, setDoc, doc, Timestamp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Function to save user data to Firestore
async function saveProcurementToFirestore(userId, formData) {
    const entryId = `${formData.name}_${formData.contractSigningDate}`; // Unique ID
    
    const procurementData = {
        name: formData.name,
        cost: formData.cost,
        procedureType: formData.procedureType,
        contractSigningDate: Timestamp.fromDate(new Date(formData.contractSigningDate)),
        procedureDuration: formData.procedureDuration,
        procedureDetails: formData.procedureDetails,
        requestSubmissionDate: Timestamp.fromDate(new Date(formData.requestSubmissionDate))
    };

    await setDoc(doc(db, `history/${userId}/entries`, entryId), procurementData);
    console.log(`✅ Saved: ${entryId}`);
}

// Example usage: Capturing form submission
document.getElementById("saveFields").addEventListener("click", async function() {
    const userId = "exampleUserId"; // Replace with actual user ID
    const formData = {
        name: document.getElementById("name").value,
        cost: Number(document.getElementById("cost").value),
        procedureType: document.getElementById("procedureType").value,
        contractSigningDate: document.getElementById("contractSigningDate").value,
        procedureDuration: 53, // Loaded dynamically
        procedureDetails: [
            { step: "Document Preparation", days: "10 tööpäeva" },
            { step: "Bid Submission", days: "15 päeva" }
        ],
        requestSubmissionDate: "2025-02-20" // Auto-calculated, can be adjusted
    };

    await saveProcurementToFirestore(userId, formData);
});
