import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { readServiceAccount } from "@/lib/firebaseAdminConfigStore";
import { readFirebaseConfig } from "@/lib/firebaseConfigStore";

// Public endpoint: a logged-in user submits proof of manual payment
// (transaction ID, or debit card details) for one order. It goes into
// `transactions` with status "pending" until an admin approves/rejects
// it from the admin panel.
//
// NOTE ON DEBIT CARD DATA: storing full card numbers carries real PCI-DSS
// / data-breach liability. This route stores whatever fields are sent
// because that's what was asked for, but the strong recommendation is to
// only ever collect the last 4 digits + cardholder name for matching
// purposes, never the full PAN or CVV.

function ensureAdminApp() {
  if (getApps().length) return getApp();
  const { serviceAccount } = readServiceAccount();
  const { config } = readFirebaseConfig();
  if (!serviceAccount || !config?.databaseURL) {
    throw new Error("Firebase Admin SDK is not fully configured yet.");
  }
  return initializeApp({ credential: cert(serviceAccount), databaseURL: config.databaseURL });
}

async function getUserFromRequest(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) throw new Error("Missing auth token.");
  ensureAdminApp();
  return getAuth().verifyIdToken(token);
}

export async function POST(request) {
  let user;
  try {
    user = await getUserFromRequest(request);
  } catch (err) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  const body = await request.json();
  const { serviceId, serviceName, packageLabel, price, paymentMethod, referenceId, cardDetails } = body;

  if (!serviceId || !packageLabel || !paymentMethod || (!referenceId && !cardDetails)) {
    return NextResponse.json(
      { error: "Service, package, payment method, and a transaction ID or card details are required." },
      { status: 400 }
    );
  }

  try {
    const db = getAdminDb();
    const newRef = db.ref("transactions").push();
    await newRef.set({
      userId: user.uid,
      userEmail: user.email || "guest",
      serviceId,
      serviceName: serviceName || "",
      packageLabel,
      price: price || 0,
      paymentMethod,
      referenceId: referenceId || "",
      cardDetails: cardDetails || null,
      status: "pending",
      createdAt: Date.now(),
    });
    return NextResponse.json({ ok: true, orderId: newRef.key });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
