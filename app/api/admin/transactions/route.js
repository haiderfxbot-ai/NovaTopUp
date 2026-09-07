import { NextResponse } from "next/server";
import { getIsAdminLoggedIn } from "@/lib/adminAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";

export async function GET() {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  try {
    const db = getAdminDb();
    const snapshot = await db.ref("transactions").get();
    return NextResponse.json({ transactions: snapshot.val() || {} });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
