// lib/firebaseConfigStore.js
//
// Where the Firebase Web SDK config actually lives, and why.
//
// Firebase's client config (apiKey, authDomain, projectId, ...) is NOT a
// secret by design -- Google's own docs say it's safe to ship to the
// browser. What we're protecting here is not "can someone see it" but
// "can someone who isn't the site admin CHANGE it". So instead of typing
// it into the source code, the admin pastes it into
// /admin-x7k9-panel/dashboard/settings, and it's saved in one of two
// places depending on how this project is hosted:
//
// 1. Self-hosted / VPS / local server (has a writable filesystem):
//    saved to data/firebase-config.local.json (already in .gitignore,
//    so it never gets pushed to GitHub).
//
// 2. Vercel (serverless, filesystem resets on every deploy):
//    the Settings page will tell the admin to instead paste the same
//    values into Vercel -> Project -> Settings -> Environment Variables.
//    Those env vars are read automatically as a fallback below.
//    This is still "not in the code" -- it's typed into Vercel's own
//    dashboard, which only someone logged into your Vercel account can
//    reach.
//
// Runtime priority: local file (if present) > environment variables.

import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "firebase-config.local.json");

const ENV_FALLBACK = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || "",
  databaseURL: process.env.FIREBASE_DATABASE_URL || "",
};

export function readFirebaseConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      if (parsed && parsed.apiKey) return { source: "file", config: parsed };
    }
  } catch (err) {
    console.error("Could not read local firebase config file:", err.message);
  }

  if (ENV_FALLBACK.apiKey) {
    return { source: "env", config: ENV_FALLBACK };
  }

  return { source: "none", config: null };
}

export function writeFirebaseConfig(config) {
  const required = ["apiKey", "authDomain", "projectId", "appId", "databaseURL"];
  const missing = required.filter((k) => !config[k]);
  if (missing.length) {
    throw new Error(`Missing required Firebase config fields: ${missing.join(", ")}`);
  }

  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  return true;
}

export function isFirebaseConfigured() {
  return readFirebaseConfig().source !== "none";
}
