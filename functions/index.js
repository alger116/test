/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

exports.initializeUserPermissions = functions.https.onCall(
  async (data, context) => {
    // Only allow main admin to trigger this
    if (
      !context.auth ||
      context.auth.token.email !== "viljarpartel@gmail.com"
    ) {
      throw new functions.https.HttpsError(
        "permission-denied",
        "Only main admin can initialize permissions",
      );
    }

    try {
      const db = admin.firestore();
      const usersRef = db.collection("users");
      const usersSnapshot = await usersRef.get();

      const batch = db.batch();
      let batchCount = 0;
      let updatedCount = 0;

      usersSnapshot.forEach((userDoc) => {
        const userData = userDoc.data();

        // Only add if customPermissions don't exist at all
        if (!userData.customPermissions) {
          const userRef = usersRef.doc(userDoc.id);

          // Create permissions based on role, preserving all other user data
          const updateData = {
            customPermissions: {
              formManagement: {
                createPresets: userData.role === "mainAdmin",
                viewPresets: true,
                editPresets: userData.role === "mainAdmin",
                deletePresets: userData.role === "mainAdmin",
                backupSettings: userData.role === "mainAdmin",
                applyPresets: true,
                manageStandardFields: userData.role === "mainAdmin",
              },
            },
          };

          // Use merge: true to preserve existing data
          batch.set(userRef, updateData, { merge: true });
          batchCount++;
          updatedCount++;

          if (batchCount === 500) {
            batch.commit();
            batchCount = 0;
          }
        }
      });

      if (batchCount > 0) {
        await batch.commit();
      }

      return { success: true, updatedCount };
    } catch (error) {
      console.error("Error initializing permissions:", error);
      throw new functions.https.HttpsError(
        "internal",
        "Error initializing permissions",
      );
    }
  },
);

exports.onCreateUser = functions.auth.user().onCreate(async (user) => {
  try {
    const db = admin.firestore();
    const userRef = db.collection("users").doc(user.uid);

    // Default permissions for new users
    const permissions = {
      formManagement: {
        createPresets: false,
        viewPresets: true,
        editPresets: false,
        deletePresets: false,
        backupSettings: false,
        applyPresets: true,
        manageStandardFields: false,
      },
    };

    // Use merge: true to preserve any existing data
    await userRef.set(
      {
        email: user.email,
        role: "tavakasutaja",
        approved: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastLogin: null,
        status: "pending",
        uid: user.uid,
        emailVerified: user.emailVerified,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        customPermissions: permissions,
      },
      { merge: true },
    );

    return null;
  } catch (error) {
    console.error("Error creating user document:", error);
    return null;
  }
});
