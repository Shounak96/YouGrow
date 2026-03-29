import { prisma } from "@/lib/db";
import { generateIdeaWithGemini } from "@/lib/gemini";
import { makeThumbnailSvg } from "@/lib/thumbnail";

function pick<T>(arr: T[]): T {
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

  const thumbs = [
    "BIG MISTAKE ❌",
    "DO THIS ✅",
    "I TRIED IT",
    "SHOCKING RESULT",
    "GROW FAST",
  ];

  return {
    hook: pick(hooks),
    title: pick(titles),
    thumbnail: `${pick(thumbs)} • ${topic.toUpperCase()}`,
  };
}

function svgToDataUrl(svg: string) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * Processes exactly one queued job.
 */
export async function processNextJob(): Promise<string> {
  const job = await prisma.job.findFirst({
    where: { status: "queued" },
    orderBy: { createdAt: "asc" },
  });

  if (!job) return "No queued jobs.";

  await prisma.job.update({
    where: { id: job.id },
    data: { status: "running", error: null },
  });

  try {
    if (job.type === "generate_idea") {
      const payload = JSON.parse(job.payload) as {
        channelId: string;
        topic: string;
      };

      const geminiIdea = await generateIdeaWithGemini(payload.topic);
      const aiIdea = geminiIdea ?? generateIdea(payload.topic);
      const source = geminiIdea ? "gemini" : "local";

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

      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "done",
          result: JSON.stringify({ ideaId: created.id }),
        },
      });

      return `Processed idea job: ${created.id}`;
    }

    if (job.type === "generate_thumbnail") {
      const payload = JSON.parse(job.payload) as { ideaId: string };

      const idea = await prisma.idea.findUnique({
        where: { id: payload.ideaId },
      });

      if (!idea) {
        throw new Error("Idea not found");
      }

      const svg = makeThumbnailSvg({
        headline: idea.thumbnail,
        sub:
          idea.title.length > 34
            ? `${idea.title.slice(0, 34)}…`
            : idea.title,
      });

      const dataUrl = svgToDataUrl(svg);

      await prisma.idea.update({
        where: { id: idea.id },
        data: { thumbnailUrl: dataUrl },
      });

      await prisma.job.update({
        where: { id: job.id },
        data: {
          status: "done",
          result: JSON.stringify({
            ideaId: idea.id,
            thumbnailUrl: dataUrl,
          }),
        },
      });

      return `Processed thumbnail job: ${idea.id}`;
    }

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        error: `Unknown job type: ${job.type}`,
      },
    });

    return `Unknown job type: ${job.type}`;
  } catch (error: any) {
    const message = String(error?.message ?? error);

    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: "failed",
        error: message,
      },
    });

    return `Job failed: ${message}`;
  }
}

export async function processQueuedJobs(limit = 5) {
  const results: string[] = [];

  for (let i = 0; i < limit; i++) {
    const result = await processNextJob();
    results.push(result);

    if (result === "No queued jobs.") {
      break;
    }
  }

  return results;
}