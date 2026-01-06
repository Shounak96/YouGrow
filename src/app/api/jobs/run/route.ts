import { NextResponse } from "next/server";
import { processNextJob } from "@/lib/jobs";

export async function POST() {
  const message = await processNextJob();
  return NextResponse.json({ ok: true, message });
}
