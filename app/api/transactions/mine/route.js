import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { readServiceAccount } from "@/lib/firebaseAdminConfigStore";
import { readFirebaseConfig } from "@/lib/firebaseConfigStore";

function ensureAdminApp() {
  if (getApps().length) return getApp();
  const { serviceAccount } = readServiceAccount();
  const { config } = readFirebaseConfig();
  if (!serviceAccount || !config?.databaseURL) {
    throw new Error("Firebase Admin SDK is not fully configured yet.");
  }
  return initializeApp({ credential: cert(serviceAccount), databaseURL: config.databaseURL });
}

export async function GET(request) {
  const authHeader = request.headers.get("authorization") || "";
  const token = authHeader.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  let user;
  try {
    ensureAdminApp();
    user = await getAuth().verifyIdToken(token);
  } catch {
    return NextResponse.json({ error: "Please log in again." }, { status: 401 });
  }

  try {
    const db = getAdminDb();
    const snapshot = await db.ref("transactions").orderByChild("userId").equalTo(user.uid).get();
    return NextResponse.json({ orders: snapshot.val() || {} });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
