import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

function isValidImageString(s: string) {
  // allow https image URLs
  if (s.startsWith("http://") || s.startsWith("https://")) return true;

  // allow base64 data urls (png/jpg/webp)
  if (s.startsWith("data:image/")) return true;

  return false;
}

export async function POST(req: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const image = String(body?.image ?? "").trim();

  if (!image || !isValidImageString(image)) {
    return NextResponse.json({ error: "Invalid image" }, { status: 400 });
  }

  // Optional: keep base64 reasonably small
  if (image.startsWith("data:image/") && image.length > 1_200_000) {
    return NextResponse.json({ error: "Image too large. Please upload a smaller photo." }, { status: 400 });
  }

  await prisma.user.update({
    where: { email: email.toLowerCase().trim() },
    data: { image },
  });

  return NextResponse.json({ ok: true });
}
