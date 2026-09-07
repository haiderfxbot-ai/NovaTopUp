// lib/adminAuth.js
//
// Phase 1 admin gate. This is intentionally simple: one hidden route,
// one username/password pair, one httpOnly cookie. Phase 2 replaces the
// credential source (currently env vars with safe defaults) with a
// proper editable "change admin username/password" screen, but the
// cookie/session mechanism here stays the same.

import { cookies } from "next/headers";
import crypto from "crypto";
import { verifyAdminPassword } from "./adminCredentialsStore";

const SESSION_COOKIE = "novatopup_admin_session";

function sign(value) {
  const secret = process.env.ADMIN_SESSION_SECRET || "dev-only-secret-change-me";
  return crypto.createHmac("sha256", secret).update(value).digest("hex");
}

export function verifyAdminCredentials(username, password) {
  return verifyAdminPassword(username, password);
}

export function createAdminSessionCookieValue() {
  const payload = `admin:${Date.now()}`;
  const signature = sign(payload);
  return `${Buffer.from(payload).toString("base64")}.${signature}`;
}

export function isValidAdminSession(cookieValue) {
  if (!cookieValue || !cookieValue.includes(".")) return false;
  const [encodedPayload, signature] = cookieValue.split(".");
  let payload;
  try {
    payload = Buffer.from(encodedPayload, "base64").toString("utf-8");
  } catch {
    return false;
  }
  return sign(payload) === signature;
}

export function getIsAdminLoggedIn() {
  const store = cookies();
  const value = store.get(SESSION_COOKIE)?.value;
  return isValidAdminSession(value);
}

export const ADMIN_SESSION_COOKIE_NAME = SESSION_COOKIE;
