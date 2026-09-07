import { NextResponse } from "next/server";
import { getAuth } from "firebase-admin/auth";
import { getAdminDb } from "@/lib/firebaseAdmin";
import { createOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/sendEmail";
import { resolveEmailFromIdentifier } from "@/lib/resolveIdentity";

export async function POST(request) {
  const { identifier, purpose } = await request.json();

  if (!identifier || !["signup", "reset"].includes(purpose)) {
    return NextResponse.json({ error: "Identifier and a valid purpose are required." }, { status: 400 });
  }

  try {
    getAdminDb(); // ensures the Admin SDK app is initialized before getAuth() below
    let email = identifier;

    if (purpose === "reset") {
      email = await resolveEmailFromIdentifier(identifier);
      if (!email) {
        // Don't reveal whether the account exists.
        return NextResponse.json({ ok: true });
      }
      try {
        await getAuth().getUserByEmail(email);
      } catch {
        return NextResponse.json({ ok: true });
      }
    }

    const code = await createOtp(email, purpose);
    await sendOtpEmail(email, code);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
