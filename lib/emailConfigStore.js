// lib/emailConfigStore.js
//
// Same "configure from the admin panel, not the code" pattern as
// Firebase. EmailJS (emailjs.com) is used to actually send the OTP
// emails — the admin creates a free EmailJS account + TWO email
// templates (one for sign-up verification, one for password reset),
// then pastes the Service ID, both Template IDs, Public Key and
// Private Key here.
//
// Both templates should expect two variables:
//   {{to_email}}  — who the code is being sent to
//   {{otp_code}}  — the 6-digit code

import fs from "fs";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), "data", "email-config.local.json");

const ENV_FALLBACK = {
  serviceId: process.env.EMAILJS_SERVICE_ID || "",
  otpTemplateId: process.env.EMAILJS_TEMPLATE_ID_OTP || "",
  resetTemplateId: process.env.EMAILJS_TEMPLATE_ID_RESET || "",
  publicKey: process.env.EMAILJS_PUBLIC_KEY || "",
  privateKey: process.env.EMAILJS_PRIVATE_KEY || "",
};

export function readEmailConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
      if (parsed.serviceId) return { source: "file", config: parsed };
    }
  } catch (err) {
    console.error("Could not read local email config file:", err.message);
  }

  if (ENV_FALLBACK.serviceId) return { source: "env", config: ENV_FALLBACK };
  return { source: "none", config: null };
}

export function writeEmailConfig(config) {
  const required = ["serviceId", "otpTemplateId", "resetTemplateId", "publicKey", "privateKey"];
  const missing = required.filter((k) => !config[k]);
  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }
  const dir = path.dirname(CONFIG_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf-8");
  return true;
}

export function isEmailConfigured() {
  return readEmailConfig().source !== "none";
}
