// lib/otp.js
import crypto from "crypto";
import { getAdminDb } from "./firebaseAdmin";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const VERIFIED_TTL_MS = 15 * 60 * 1000; // window to finish signup/reset after verifying
const MAX_ATTEMPTS = 5;

function sanitizeEmailKey(email) {
  return email.trim().toLowerCase().replace(/[.#$[\]]/g, "_");
}

function hashCode(code) {
  return crypto.createHash("sha256").update(code).digest("hex");
}

export function generateOtpCode() {
  return String(crypto.randomInt(100000, 999999));
}

export async function createOtp(email, purpose) {
  const db = getAdminDb();
  const code = generateOtpCode();
  const key = sanitizeEmailKey(email);

  await db.ref(`otps/${key}`).set({
    email: email.trim().toLowerCase(),
    purpose,
    codeHash: hashCode(code),
    expiresAt: Date.now() + OTP_TTL_MS,
    attempts: 0,
    verified: false,
  });

  return code;
}

export async function verifyOtp(email, code, purpose) {
  const db = getAdminDb();
  const key = sanitizeEmailKey(email);
  const ref = db.ref(`otps/${key}`);
  const snapshot = await ref.get();

  if (!snapshot.exists()) throw new Error("No verification code was requested for this email.");
  const record = snapshot.val();

  if (record.purpose !== purpose) throw new Error("This code was requested for a different action.");
  if (Date.now() > record.expiresAt) throw new Error("This code has expired. Request a new one.");
  if (record.attempts >= MAX_ATTEMPTS) throw new Error("Too many attempts. Request a new code.");

  if (record.codeHash !== hashCode(code)) {
    await ref.update({ attempts: record.attempts + 1 });
    throw new Error("Incorrect code.");
  }

  await ref.update({ verified: true, verifiedAt: Date.now() });
  return true;
}

// Used right before finishing signup / resetting the password, to make
// sure the code was actually verified a moment ago (and isn't stale).
export async function consumeVerifiedOtp(email, purpose) {
  const db = getAdminDb();
  const key = sanitizeEmailKey(email);
  const ref = db.ref(`otps/${key}`);
  const snapshot = await ref.get();

  if (!snapshot.exists()) throw new Error("Please verify your email again.");
  const record = snapshot.val();

  if (record.purpose !== purpose || !record.verified) {
    throw new Error("Please verify your email again.");
  }
  if (Date.now() > record.verifiedAt + VERIFIED_TTL_MS) {
    throw new Error("Verification expired — please request a new code.");
  }

  await ref.remove();
  return true;
}
