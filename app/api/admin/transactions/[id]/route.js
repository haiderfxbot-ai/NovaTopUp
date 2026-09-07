import { NextResponse } from "next/server";
import { getIsAdminLoggedIn } from "@/lib/adminAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function PATCH(request, { params }) {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const { status } = await request.json();
  if (!["approved", "rejected", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid status." }, { status: 400 });
  }
  try {
    const db = getAdminDb();
    await db.ref(`transactions/${params.id}`).update({
      status,
      reviewedAt: Date.now(),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
