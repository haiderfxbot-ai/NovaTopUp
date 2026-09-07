// lib/firebaseAdminConfigStore.js
//
// The admin panel (services, transactions, payment accounts) writes to
// Firebase through the Admin SDK on the server, not through the browser.
// This keeps the Realtime Database security rules locked down to "only
// signed-in users can read/write their own data" while the admin panel —
// protected separately by the admin cookie session — bypasses those rules
// safely from the server.
//
// The service account JSON is pasted once into Settings and stored here,
// same pattern as the web config: local file for self-hosting, env var
// fallback for Vercel.

import fs from "fs";
import path from "path";

const SERVICE_ACCOUNT_PATH = path.join(
  process.cwd(),
  "data",
  "firebase-service-account.local.json"
);

export function readServiceAccount() {
  try {
    if (fs.existsSync(SERVICE_ACCOUNT_PATH)) {
      const raw = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf-8"));
      if (raw.project_id && raw.private_key) return { source: "file", serviceAccount: raw };
    }
  } catch (err) {
    console.error("Could not read local Firebase service account file:", err.message);
  }

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const parsed = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      return { source: "env", serviceAccount: parsed };
    } catch {
      console.error("FIREBASE_SERVICE_ACCOUNT_JSON env var is not valid JSON.");
    }
  }

  return { source: "none", serviceAccount: null };
}

export function writeServiceAccount(serviceAccountJsonString) {
  let parsed;
  try {
    parsed = JSON.parse(serviceAccountJsonString);
  } catch {
    throw new Error("That doesn't look like valid JSON. Paste the full service account file contents.");
  }
  if (!parsed.project_id || !parsed.private_key || !parsed.client_email) {
    throw new Error("This JSON is missing project_id, private_key, or client_email — make sure it's the full service account key file.");
  }

  const dir = path.dirname(SERVICE_ACCOUNT_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SERVICE_ACCOUNT_PATH, JSON.stringify(parsed, null, 2), "utf-8");
  return true;
}

export function isServiceAccountConfigured() {
  return readServiceAccount().source !== "none";
}
