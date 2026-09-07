import { NextResponse } from "next/server";
import { getIsAdminLoggedIn } from "@/lib/adminAuth";
import { readFirebaseConfig, writeFirebaseConfig } from "@/lib/firebaseConfigStore";

export async function GET() {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { source, config } = readFirebaseConfig();
  return NextResponse.json({ source, config });
}

export async function POST(request) {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json();

  try {
    writeFirebaseConfig(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
