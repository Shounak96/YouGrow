// src/lib/mailer.ts
import { Resend } from "resend";

type SendEmailArgs = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(args: SendEmailArgs) {
  const devMode = process.env.DEV_EMAIL_MODE === "true";

  // ✅ DEV MODE: don't send, just log
  if (devMode) {
    console.log("📧 DEV_EMAIL_MODE is ON. Email not sent.");
    console.log("To:", args.to);
    console.log("Subject:", args.subject);
    // If your HTML contains the confirm link, it will be visible in logs.
    return { ok: true, dev: true };
  }

  // ✅ Real sending (only if you later configure domains)
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY");

  const resend = new Resend(apiKey);

  const from = process.env.MAIL_FROM || "YouGrow <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: args.to,
    subject: args.subject,
    html: args.html,
  });

  if (error) throw new Error(error.message);
  return { ok: true };
}
