const fs = require('fs');
const path = require('path');

// Read the .env file
const envContent = fs.readFileSync('.env', 'utf8');
const config = {};

// Parse the .env file
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    const cleanKey = key.trim().replace('FIREBASE_', '').toLowerCase();
    config[cleanKey] = value.trim();
  }
});

// Create the Firebase config object
const firebaseConfig = {
  apiKey: config.api_key,
  authDomain: config.auth_domain,
  projectId: config.project_id,
  storageBucket: config.storage_bucket,
  messagingSenderId: config.messaging_sender_id,
  appId: config.app_id,
  measurementId: config.measurement_id,
};

// Generate the config file content
const configFileContent = `export const firebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};`;

// Write to the generated config file
fs.writeFileSync(path.join('auth', 'firebase-config-generated.js'), configFileContent);

console.log('Firebase config generated successfully!');
