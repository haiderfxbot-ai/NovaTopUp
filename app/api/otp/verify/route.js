import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/otp";
import { resolveEmailFromIdentifier } from "@/lib/resolveIdentity";

export async function POST(request) {
  const { identifier, code, purpose } = await request.json();
  if (!identifier || !code || !purpose) {
    return NextResponse.json({ error: "Identifier, code, and purpose are required." }, { status: 400 });
  }

  try {
    const email = purpose === "signup" ? identifier : await resolveEmailFromIdentifier(identifier);
    if (!email) return NextResponse.json({ error: "Incorrect code." }, { status: 400 });

    await verifyOtp(email, code, purpose);
    return NextResponse.json({ ok: true, email });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
