import { NextResponse } from "next/server";
import { getIsAdminLoggedIn } from "@/lib/adminAuth";
import { writeServiceAccount, isServiceAccountConfigured } from "@/lib/firebaseAdminConfigStore";

export async function GET() {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  return NextResponse.json({ configured: isServiceAccountConfigured() });
}

export async function POST(request) {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { serviceAccountJson } = await request.json();
  try {
    writeServiceAccount(serviceAccountJson);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
