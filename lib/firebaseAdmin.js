// lib/firebaseAdmin.js
//
// Server-only Firebase Admin SDK bootstrap. Every /api/admin/* route that
// touches the database calls getAdminDb() instead of importing
// firebase-admin directly, so there's one place that knows how to find
// the credentials and the database URL.
//
// This is also where the starter database "tables" (services, orders,
// transactions, coupons, paymentAccounts, users, admins, settings) get
// created the first time the Admin SDK connects — using the Admin SDK
// means this always works regardless of Realtime Database security
// rules, since the Admin SDK bypasses rules entirely. It only ever
// writes a key if it doesn't already exist, so it never overwrites real
// data on later calls.

import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { readServiceAccount } from "./firebaseAdminConfigStore";
import { readFirebaseConfig } from "./firebaseConfigStore";

let cachedDb = null;

const DEFAULT_DB_SHAPE = {
  users: {},
  admins: {},
  services: {},
  orders: {},
  transactions: {},
  coupons: {},
  paymentAccounts: {},
  settings: { siteName: "NovaTopUp" },
};

async function ensureDefaultTables(db) {
  for (const [tableName, defaultValue] of Object.entries(DEFAULT_DB_SHAPE)) {
    const tableRef = db.ref(tableName);
    const snapshot = await tableRef.get();
    if (!snapshot.exists()) {
      await tableRef.set(defaultValue);
    }
  }
}

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
  ensureDefaultTables(cachedDb).catch((err) =>
    console.error("Could not initialize default database tables:", err.message)
  );

  return cachedDb;
}
