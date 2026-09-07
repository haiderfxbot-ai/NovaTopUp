import { NextResponse } from "next/server";
import { getIsAdminLoggedIn } from "@/lib/adminAuth";
import { getAdminDb } from "@/lib/firebaseAdmin";

// Each entry: { method: "easypaisa"|"jazzcash"|"binance", label, accountNumber, accountTitle, active }
export async function GET() {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  try {
    const db = getAdminDb();
    const snapshot = await db.ref("paymentAccounts").get();
    return NextResponse.json({ accounts: snapshot.val() || {} });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  const body = await request.json();
  const { method, label, accountNumber, accountTitle } = body;

  if (!method || !accountNumber || !accountTitle) {
    return NextResponse.json(
      { error: "Method, account number, and account title are required." },
      { status: 400 }
    );
  }

  try {
    const db = getAdminDb();
    const newRef = db.ref("paymentAccounts").push();
    await newRef.set({
      method,
      label: label || method,
      accountNumber,
      accountTitle,
      active: true,
      createdAt: Date.now(),
    });
    return NextResponse.json({ ok: true, id: newRef.key });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
