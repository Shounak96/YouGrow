import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const firstName = String(body.firstName ?? "").trim();
    const lastName = String(body.lastName ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const username = String(body.username ?? "").trim().toLowerCase();
    const password = String(body.password ?? "");

    // basic validation
    if (!firstName || !lastName) {
      return NextResponse.json({ error: "Name and surname are required." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }
    if (!username || username.length < 3) {
      return NextResponse.json({ error: "Username must be at least 3 characters." }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
    }

    // ✅ IMPORTANT: build OR conditions only when values exist
    const or: Array<{ email?: string; username?: string }> = [];
    if (email) or.push({ email });
    if (username) or.push({ username });

    const existing = await prisma.user.findFirst({
      where: { OR: or },
      select: { id: true, email: true, username: true },
    });

    if (existing) {
      const msg =
        existing.email === email
          ? "Email already in use."
          : "Username already in use.";
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email,
        username,
        passwordHash,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ? String(e.message) : "Signup failed" },
      { status: 500 }
    );
  }
}
