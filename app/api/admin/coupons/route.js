import { NextResponse } from "next/server";
import { getIsAdminLoggedIn } from "@/lib/adminAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  try {
    const db = getAdminDb();
    const snapshot = await db.ref("coupons").get();
    return NextResponse.json({ coupons: snapshot.val() || {} });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const body = await request.json();
  const { code, discountPercent, expiresAt } = body;

  if (!code || !discountPercent) {
    return NextResponse.json({ error: "Code and discount percent are required." }, { status: 400 });
  }

  try {
    const db = getAdminDb();
    const key = code.trim().toUpperCase();
    await db.ref(`coupons/${key}`).set({
      code: key,
      discountPercent: Number(discountPercent),
      expiresAt: expiresAt ? new Date(expiresAt).getTime() : null,
      active: true,
      createdAt: Date.now(),
    });
    return NextResponse.json({ ok: true, code: key });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
