// lib/sendEmail.js
import { readEmailConfig } from "./emailConfigStore";

export async function sendOtpEmail(toEmail, otpCode, purpose) {
  const { config } = readEmailConfig();
  if (!config) {
    throw new Error("Email sending is not configured yet. Ask the admin to add EmailJS keys in Settings.");
  }

  const templateId = purpose === "reset" ? config.resetTemplateId : config.otpTemplateId;
  if (!templateId) {
    throw new Error(`No EmailJS template configured for "${purpose}" yet.`);
  }

  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: config.serviceId,
      template_id: templateId,
      user_id: config.publicKey,
      accessToken: config.privateKey,
      template_params: {
        to_email: toEmail,
        otp_code: otpCode,
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to send OTP email: ${text}`);
  }
  return true;
}
