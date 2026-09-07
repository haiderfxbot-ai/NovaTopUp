import { NextResponse } from "next/server";
import { readFirebaseConfig } from "@/lib/firebaseConfigStore";

// Public on purpose: Firebase's web SDK config is designed to be visible
// in the browser (it is not a secret credential). Access control happens
// through Firebase Auth + Realtime Database security rules, not by
// hiding this config.
export async function GET() {
  const { source, config } = readFirebaseConfig();
  if (!config) {
    return NextResponse.json({ configured: false }, { status: 200 });
  }
  return NextResponse.json({ configured: true, source, config });
}
