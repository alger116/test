const functions = require("firebase-functions");
const OpenAI = require("openai");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_KEY, // Ensure you have set this environment variable
});

exports.chat = functions.https.onCall(async (data, context) => {
  // 1. Retrieve context from Firestore
  const history = await getChatHistory(data.userId);

  // 2. Construct prompt
  const messages = [
    {
      role: "system",
      content: "Oled ostumenetluse assistent. Kasutaja andmed: " + history,
    },
    { role: "user", content: data.prompt },
  ];

  // 3. OpenAI request
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: messages,
  });

  // 4. Save response to Firestore
  await saveInteraction(
    data.userId,
    data.prompt,
    completion.choices[0].message.content,
  );

  return { response: completion.choices[0].message.content };
});

async function getChatHistory(userId) {
  const snapshot = await db.collection("chats").doc(userId).get();
  return snapshot.exists ? snapshot.data().history : "Puudub ajalugu";
}

async function saveInteraction(userId, question, answer) {
  await db
    .collection("chats")
    .doc(userId)
    .set(
      {
        history: admin.firestore.FieldValue.arrayUnion({
          question,
          answer,
          timestamp: new Date(),
        }),
      },
      { merge: true },
    );
}
