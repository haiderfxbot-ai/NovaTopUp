import { NextResponse } from "next/server";
import { getIsAdminLoggedIn } from "@/lib/adminAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { validateServicePayload } from "@/lib/serviceValidation";

export async function PUT(request, { params }) {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const body = await request.json();

  try {
    const service = validateServicePayload(body);
    const db = getAdminDb();
    const ref = db.ref(`services/${params.id}`);
    const existing = await ref.get();
    if (!existing.exists()) {
      return NextResponse.json({ error: "Service not found." }, { status: 404 });
    }
    await ref.update(service);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  try {
    const db = getAdminDb();
    await db.ref(`services/${params.id}`).remove();
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
