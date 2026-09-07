import { NextResponse } from "next/server";
import { getIsAdminLoggedIn } from "@/lib/adminAuth";
import {
  verifyAdminPassword,
  setAdminCredentials,
  getAdminUsernameForDisplay,
} from "@/lib/adminCredentialsStore";

export async function GET() {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }
  return NextResponse.json({ username: getAdminUsernameForDisplay() });
}

export async function POST(request) {
  if (!getIsAdminLoggedIn()) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const { currentPassword, newUsername, newPassword } = await request.json();
  const currentUsername = getAdminUsernameForDisplay();

  if (!verifyAdminPassword(currentUsername, currentPassword || "")) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
  }

  try {
    setAdminCredentials(newUsername, newPassword);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
