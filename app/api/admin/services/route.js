import { NextResponse } from "next/server";
import { getIsAdminLoggedIn } from "@/lib/adminAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { validateServicePayload } from "@/lib/serviceValidation";

export async function GET() {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  try {
    const db = getAdminDb();
    const snapshot = await db.ref("services").get();
    return NextResponse.json({ services: snapshot.val() || {} });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const body = await request.json();

  try {
    const service = validateServicePayload(body);
    service.createdAt = Date.now();
    const db = getAdminDb();
    const newRef = db.ref("services").push();
    await newRef.set(service);
    return NextResponse.json({ ok: true, id: newRef.key });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
