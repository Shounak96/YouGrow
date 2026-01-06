import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";
import crypto from "crypto";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newEmail } = await req.json().catch(() => ({ newEmail: "" }));
  const email = String(newEmail || "").toLowerCase().trim();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Load DB user
  // Load DB user (prefer id, fallback to email)
    const userId = (session.user as any).id as string | undefined;
    const sessionEmail = String(session.user.email || "").toLowerCase().trim();

    const user = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, accounts: { select: { id: true } } },
        })
    : await prisma.user.findUnique({
        where: { email: sessionEmail },
        select: { id: true, email: true, accounts: { select: { id: true } } },
        });

    if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


  // Credentials-only: block OAuth users
  const isOAuthUser = (user.accounts?.length ?? 0) > 0;
  if (isOAuthUser) {
    return NextResponse.json(
      { error: "Email is managed by Google sign-in." },
      { status: 400 }
    );
  }

  if (email === user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "That’s already your current email." },
      { status: 400 }
    );
  }

  // Prevent duplicates
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json(
      { error: "That email is already in use." },
      { status: 400 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await prisma.user.update({
    where: { id: user.id },
    data: {
      pendingEmail: email,
      emailChangeToken: token,
      emailChangeExpires: expires,
    },
  });

  // Build confirm URL (works on localhost + Vercel)
  const origin =
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    new URL(req.url).origin;

  const confirmUrl = `${origin}/profile/email-confirm?token=${token}`;
  console.log("✅ Email change confirm:", confirmUrl);


  // Send email
  await sendEmail({
    to: email,
    subject: "Confirm your new email for YouGrow",
    html: `
      <div style="font-family: ui-sans-serif, system-ui; line-height:1.5">
        <h2 style="margin:0 0 12px 0;">Confirm your email</h2>
        <p>Click the button below to confirm your new email address for <b>YouGrow</b>.</p>
        <p style="margin:18px 0;">
          <a href="${confirmUrl}" 
             style="display:inline-block;padding:10px 14px;border-radius:10px;
                    background:#111;color:#fff;text-decoration:none;">
            Confirm new email
          </a>
        </p>
        <p style="color:#666;font-size:12px;">
          This link expires in 30 minutes. If you didn’t request this, you can ignore this email.
        </p>
      </div>
    `,
  });
  
  return NextResponse.json({
  ok: true,
  confirmUrl, // 👈 ADD THIS
});

}
