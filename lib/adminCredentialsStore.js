// lib/adminCredentialsStore.js
//
// Same "not hardcoded" pattern as the Firebase config: admin username and
// password can be changed from the Settings screen. When changed, they're
// saved (password hashed, never in plain text) to
// data/admin-credentials.local.json. Until changed, the app falls back to
// ADMIN_USERNAME / ADMIN_PASSWORD environment variables (or the built-in
// defaults) so a fresh deploy always has *some* way to log in.

import fs from "fs";
import path from "path";
import crypto from "crypto";

const CREDS_PATH = path.join(process.cwd(), "data", "admin-credentials.local.json");

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}

export function getStoredAdminCredentials() {
  try {
    if (fs.existsSync(CREDS_PATH)) {
      const raw = JSON.parse(fs.readFileSync(CREDS_PATH, "utf-8"));
      if (raw.username && raw.passwordHash && raw.salt) return raw;
    }
  } catch (err) {
    console.error("Could not read admin credentials file:", err.message);
  }
  return null;
}

export function verifyAdminPassword(username, password) {
  const stored = getStoredAdminCredentials();

  if (stored) {
    if (username !== stored.username) return false;
    return hashPassword(password, stored.salt) === stored.passwordHash;
  }

  // Fallback: env vars / built-in default (Phase 1 behaviour)
  const envUsername = process.env.ADMIN_USERNAME || "admin";
  const envPassword = process.env.ADMIN_PASSWORD || "ChangeMe_123!";
  return username === envUsername && password === envPassword;
}

export function setAdminCredentials(newUsername, newPassword) {
  if (!newUsername || !newPassword || newPassword.length < 8) {
    throw new Error("Username is required and password must be at least 8 characters.");
  }
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(newPassword, salt);

  const dir = path.dirname(CREDS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    CREDS_PATH,
    JSON.stringify({ username: newUsername, passwordHash, salt }, null, 2),
    "utf-8"
  );
  return true;
}

export function getAdminUsernameForDisplay() {
  const stored = getStoredAdminCredentials();
  if (stored) return stored.username;
  return process.env.ADMIN_USERNAME || "admin";
}
