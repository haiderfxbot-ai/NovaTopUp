import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { consumeVerifiedOtp } from "@/lib/otp";
import { resolveEmailFromIdentifier } from "@/lib/resolveIdentity";

export async function POST(request) {
  const { identifier, newPassword } = await request.json();
  if (!identifier || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Identifier and a password of at least 6 characters are required." }, { status: 400 });
  }

  try {
    getAdminDb();
    const email = await resolveEmailFromIdentifier(identifier);
    if (!email) return NextResponse.json({ error: "Verification expired — please request a new code." }, { status: 400 });

    await consumeVerifiedOtp(email, "reset");

    const user = await getAuth().getUserByEmail(email);
    await getAuth().updateUser(user.uid, { password: newPassword });

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
