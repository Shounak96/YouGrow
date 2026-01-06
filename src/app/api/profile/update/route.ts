import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id as string | undefined;
  if (!userId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as {
    username?: string;
    firstName?: string;
    lastName?: string;
  };

  const username = String(body.username ?? "").trim();
  const firstName = String(body.firstName ?? "").trim();
  const lastName = String(body.lastName ?? "").trim();

  if (!firstName || !lastName) {
    return NextResponse.json(
      { ok: false, error: "Name and surname are required." },
      { status: 400 }
    );
  }

  if (username.length < 3) {
    return NextResponse.json(
      { ok: false, error: "Username must be at least 3 characters." },
      { status: 400 }
    );
  }

  // Allow letters/numbers/underscore/dot (professional)
  if (!/^[a-zA-Z0-9_.]+$/.test(username)) {
    return NextResponse.json(
      { ok: false, error: "Username can only use letters, numbers, _ and ." },
      { status: 400 }
    );
  }

  // Check unique username (excluding this user)
  const existing = await prisma.user.findFirst({
    where: {
      username,
      NOT: { id: userId },
    },
    select: { id: true },
  });

  if (existing) {
    return NextResponse.json(
      { ok: false, error: "Username already taken." },
      { status: 409 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      username,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`.trim(),
    },
    select: {
      username: true,
      firstName: true,
      lastName: true,
      name: true,
    },
  });

  return NextResponse.json({ ok: true, user: updated });
}
