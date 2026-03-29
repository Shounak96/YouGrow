import type { NextRequest } from "next/server";
import { processQueuedJobs } from "@/lib/jobs";
import { auth } from "@/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isValidCronRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: NextRequest) {
  if (!isValidCronRequest(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const results = await processQueuedJobs(5);

  return Response.json({
    ok: true,
    trigger: "cron",
    results,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const results = await processQueuedJobs(5);

  return Response.json({
    ok: true,
    trigger: "manual",
    results,
  });
}