"use client";

// lib/firebase.js
//
// Firebase is never initialized with hardcoded keys here. On first use,
// this file fetches the current config from /api/firebase-config (which
// reads whatever the admin saved in Settings, or env vars on Vercel),
// initializes the SDK once, and — the first time it connects — writes a
// starter shape into the Realtime Database so every role/table this app
// needs already exists instead of erroring on missing paths.

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { getDatabase, ref, get, set, onValue } from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

let cachedClients = null;
let bootstrapPromise = null;

// The full set of tables/roles the platform needs. Running this is safe
// to call every time — it only ever writes a key if it does not already
// exist, so it never overwrites real data on later runs.
const DEFAULT_DB_SHAPE = {
  users: {},          // role: customer
  admins: {},         // role: admin (profile only — login itself is separate)
  services: {},        // e.g. Free Fire Diamonds, PUBG UC, TikTok Coins
  orders: {},          // one entry per purchase, keyed by order id
  transactions: {},    // manual payment submissions awaiting admin approval
  coupons: {},         // daily/redeemable coupon codes
  paymentAccounts: {}, // admin-entered Easypaisa/JazzCash/Binance numbers shown to users
  settings: {
    siteName: "NovaTopUp",
  },
};

async function fetchRuntimeConfig() {
  const res = await fetch("/api/firebase-config", { cache: "no-store" });
  const data = await res.json();
  if (!data.configured) {
    throw new Error(
      "Firebase is not connected yet. Ask the admin to add the Firebase config from the hidden admin settings page."
    );
  }
  return data.config;
}

async function ensureDefaultTables(db) {
  for (const [tableName, defaultValue] of Object.entries(DEFAULT_DB_SHAPE)) {
    const tableRef = ref(db, tableName);
    const snapshot = await get(tableRef);
    if (!snapshot.exists()) {
      await set(tableRef, defaultValue);
    }
  }
}

export async function getFirebaseClients() {
  if (cachedClients) return cachedClients;
  if (bootstrapPromise) return bootstrapPromise;

  bootstrapPromise = (async () => {
    const config = await fetchRuntimeConfig();
    const app = getApps().length ? getApp() : initializeApp(config);
    const auth = getAuth(app);
    const db = getDatabase(app);

    await ensureDefaultTables(db);

    cachedClients = { app, auth, db };
    return cachedClients;
  })();

  return bootstrapPromise;
}

export async function signUpWithEmail(email, password) {
  const { auth } = await getFirebaseClients();
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithEmail(email, password) {
  const { auth } = await getFirebaseClients();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function signInWithGoogle() {
  const { auth } = await getFirebaseClients();
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function continueAsGuest() {
  const { auth } = await getFirebaseClients();
  return signInAnonymously(auth);
}

export async function signOutUser() {
  const { auth } = await getFirebaseClients();
  return firebaseSignOut(auth);
}

export function watchAuthState(callback) {
  // Fire callback with the current user whenever auth state changes.
  // Returns an unsubscribe function.
  let unsub = () => {};
  getFirebaseClients().then(({ auth }) => {
    unsub = onAuthStateChanged(auth, callback);
  });
  return () => unsub();
}

// ---- Public reads (services, payment accounts, coupons) ----
// Realtime Database rules should allow public read on these three paths
// and deny public write (writes only happen server-side through the
// Admin SDK, protected by the admin cookie session). See README for the
// suggested rules JSON.

export async function fetchServices() {
  const { db } = await getFirebaseClients();
  const snapshot = await get(ref(db, "services"));
  return snapshot.val() || {};
}

export async function fetchServiceById(id) {
  const { db } = await getFirebaseClients();
  const snapshot = await get(ref(db, `services/${id}`));
  return snapshot.exists() ? snapshot.val() : null;
}

export async function fetchPaymentAccounts() {
  const { db } = await getFirebaseClients();
  const snapshot = await get(ref(db, "paymentAccounts"));
  return snapshot.val() || {};
}

export async function fetchActiveCoupons() {
  const { db } = await getFirebaseClients();
  const snapshot = await get(ref(db, "coupons"));
  const all = snapshot.val() || {};
  const now = Date.now();
  return Object.fromEntries(
    Object.entries(all).filter(
      ([, c]) => c.active !== false && (!c.expiresAt || c.expiresAt > now)
    )
  );
}

// ---- Transactions (order submission + history) ----
// These go through Next.js API routes (not direct DB writes) because the
// server verifies the Firebase ID token and writes via the Admin SDK.

export async function submitOrder(orderPayload) {
  const { auth } = await getFirebaseClients();
  if (!auth.currentUser) throw new Error("Please log in first.");
  const token = await auth.currentUser.getIdToken();

  const res = await fetch("/api/transactions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderPayload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not submit the order.");
  return data;
}

export async function fetchMyOrders() {
  const { auth } = await getFirebaseClients();
  if (!auth.currentUser) throw new Error("Please log in first.");
  const token = await auth.currentUser.getIdToken();

  const res = await fetch("/api/transactions/mine", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not load your orders.");
  return data.orders || {};
}

export async function saveUserProfile(uid, profile) {
  const { db } = await getFirebaseClients();
  await set(ref(db, `users/${uid}`), profile);
}
