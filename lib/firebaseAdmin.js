// lib/firebaseAdmin.js
//
// Server-only Firebase Admin SDK bootstrap. Every /api/admin/* route that
// touches the database calls getAdminDb() instead of importing
// firebase-admin directly, so there's one place that knows how to find
// the credentials and the database URL.

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { readServiceAccount } from "./firebaseAdminConfigStore";
import { readFirebaseConfig } from "./firebaseConfigStore";

let cachedDb = null;

export function getAdminDb() {
  if (cachedDb) return cachedDb;

  const { serviceAccount } = readServiceAccount();
  const { config } = readFirebaseConfig();

  if (!serviceAccount) {
    throw new Error(
      "Firebase Admin SDK is not connected yet. Paste the service account JSON in admin Settings."
    );
  }
  if (!config || !config.databaseURL) {
    throw new Error("Firebase Realtime Database URL is not set yet. Save the Firebase web config in Settings first.");
  }

  const app = getApps().length
    ? getApp()
    : initializeApp({
        credential: cert(serviceAccount),
        databaseURL: config.databaseURL,
      });

  cachedDb = getDatabase(app);
  return cachedDb;
}
