import { prisma } from "@/lib/db";
import { generateIdeaWithGemini } from "@/lib/gemini";
import fs from "node:fs/promises";
import path from "node:path";
import { makeThumbnailSvg } from "@/lib/thumbnail";




function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateIdea(topic: string) {
  const hooks = [
    `Stop doing this if you want to grow: ${topic}`,
    `I tried ${topic} for 7 days—here’s what happened`,
    `Most creators get ${topic} wrong (do this instead)`,
    `The fastest way to improve ${topic} in 10 minutes`,
    `I wish I knew this about ${topic} earlier`,
  ];

  const titles = [
    `${topic}: The Only Strategy You Need (2026)`,
    `I Tested ${topic} So You Don’t Have To`,
    `Do THIS for ${topic} (It Works FAST)`,
    `The Truth About ${topic} (No One Tells You)`,
    `${topic} Made Simple: Step-by-Step`,
  ];

  const thumbs = ["BIG MISTAKE ❌", "DO THIS ✅", "I TRIED IT", "SHOCKING RESULT", "GROW FAST"];

  return {
    hook: pick(hooks),
    title: pick(titles),
    thumbnail: `${pick(thumbs)} • ${topic.toUpperCase()}`,
  };
}

/**
 * Processes exactly ONE queued job.
 * Returns a small summary string for UI.
 */
export async function processNextJob(): Promise<string> {
  const job = await prisma.job.findFirst({
    where: { status: "queued" },
    orderBy: { createdAt: "asc" },
  });

  if (!job) return "No queued jobs.";

  // Mark running
  await prisma.job.update({
    where: { id: job.id },
    data: { status: "running", error: null },
  });

  try {
    if (job.type === "generate_idea") {
  const payload = JSON.parse(job.payload) as { channelId: string; topic: string };

  // 1) Try Gemini first, then fallback
  const geminiIdea = await generateIdeaWithGemini(payload.topic);
  const aiIdea = geminiIdea ?? generateIdea(payload.topic);
  const source = geminiIdea ? "gemini" : "local";


  // 2) Create DB record (THIS has the id)
  const created = await prisma.idea.create({
    data: {
      channelId: payload.channelId,
      topic: payload.topic,
      hook: aiIdea.hook,
      title: aiIdea.title,
      thumbnail: aiIdea.thumbnail,
      source,
    },
  });

  // 3) Mark job done with result
  await prisma.job.update({
    where: { id: job.id },
    data: {
      status: "done",
      result: JSON.stringify({ ideaId: created.id }),
    },
  });

  return `Processed job ✅ Created idea: ${created.id}`;
}

if (job.type === "generate_thumbnail") {
  const payload = JSON.parse(job.payload) as { ideaId: string };

  const idea = await prisma.idea.findUnique({ where: { id: payload.ideaId } });
  if (!idea) throw new Error("Idea not found");

  // Make PNG from idea.thumbnail text
  const svg = makeThumbnailSvg({
  headline: idea.thumbnail,
  sub: idea.title.length > 34 ? idea.title.slice(0, 34) + "…" : idea.title,
});

const relUrl = `/generated/thumbnails/${idea.id}.svg`;
const outDir = path.join(process.cwd(), "public", "generated", "thumbnails");
await fs.mkdir(outDir, { recursive: true });

const outPath = path.join(outDir, `${idea.id}.svg`);
await fs.writeFile(outPath, svg, "utf8");

await prisma.idea.update({
  where: { id: idea.id },
  data: { thumbnailUrl: relUrl },
});

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "done", result: JSON.stringify({ ideaId: idea.id, thumbnailUrl: relUrl }) },
  });

  return `Processed job ✅ Generated thumbnail for idea: ${idea.id}`;
}



    // Unknown job type
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", error: `Unknown job type: ${job.type}` },
    });

    return `Job failed ❌ Unknown type: ${job.type}`;
  } catch (e: any) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: "failed", error: String(e?.message ?? e) },
    });

    return `Job failed ❌ ${String(e?.message ?? e)}`;
  }

  
}
