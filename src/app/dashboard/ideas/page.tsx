import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProButton } from "@/components/ui/pro-button";
import { Badge } from "@/components/ui/badge";
import { revalidatePath } from "next/cache";
import { JobRunner } from "@/components/jobs/job-runner";
import { auth } from "@/auth";
import { redirect } from "next/navigation";


async function enqueueIdeaJob(formData: FormData) {
  "use server";

  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/login?next=/dashboard/ideas");

  const channelId = String(formData.get("channelId") || "");
  const topic = String(formData.get("topic") || "").trim();
  if (!channelId || !topic) return;

  await prisma.job.create({
    data: {
      userId, // ✅ attach owner
      type: "generate_idea",
      status: "queued",
      payload: JSON.stringify({ channelId, topic }),
    },
  });

  revalidatePath("/dashboard/ideas");
}


async function enqueueThumbnailJob(formData: FormData) {
  "use server";

  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;
  if (!userId) redirect("/login?next=/dashboard/ideas");

  const ideaId = String(formData.get("ideaId") || "");
  if (!ideaId) return;

  await prisma.job.create({
    data: {
      userId, // ✅ attach owner
      type: "generate_thumbnail",
      status: "queued",
      payload: JSON.stringify({ ideaId }),
    },
  });

  revalidatePath("/dashboard/ideas");
}



export default async function IdeasPage() {
  const session = await auth();
const userId = (session?.user as any)?.id as string | undefined;
if (!userId) redirect("/login?next=/dashboard/ideas");

const channels = await prisma.channel.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
});

const ideas = await prisma.idea.findMany({
  where: { channel: { userId } },
  orderBy: { createdAt: "desc" },
  include: { channel: true },
  take: 12,
});

const jobs = await prisma.job.findMany({
  where: { userId },
  orderBy: { createdAt: "desc" },
  take: 12,
});


  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Ideas</h2>
            <Badge variant="secondary">Job Queue</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Generate Ideas for your topic
          </p>
        </div>

        <JobRunner />
      </div>

      {/* Queue job */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Queue an idea job</CardTitle>
        </CardHeader>
        <CardContent>
          {channels.length === 0 ? (
            <div className="text-sm text-gray-600">
              Add a channel first on{" "}
              <a className="underline" href="/dashboard/channel">
                Channel
              </a>
              .
            </div>
          ) : (
            <form action={enqueueIdeaJob} className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-sm font-semibold">Channel</label>
                <select
                  name="channelId"
                  className="w-full rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                  defaultValue={channels[0]?.id}
                >
                  {channels.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="text-sm font-semibold">Topic</label>
                <input
                  name="topic"
                  placeholder="e.g., YouTube shorts hooks, editing, thumbnails..."
                  className="w-full rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
                />
              </div>

              <div className="sm:col-span-3">
                <ProButton type="submit">Queue Job</ProButton>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Jobs list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent jobs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {jobs.length === 0 ? (
            <div className="text-sm text-gray-600">No jobs yet. Queue one above.</div>
          ) : (
            jobs.map((j) => (
              <div
                key={j.id}
                className="flex flex-col gap-1 rounded-2xl border border-[hsl(var(--border))] bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-semibold">{j.type}</div>
                  <div className="text-xs text-gray-600">Status: {j.status}</div>
                  {j.error ? (
                    <div className="text-xs text-red-600">Error: {j.error}</div>
                  ) : null}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(j.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Ideas list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent ideas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {ideas.length === 0 ? (
            <div className="text-sm text-gray-600">
              No ideas yet. Queue a job, then click “Run Worker Once”.
            </div>
          ) : (
            ideas.map((i) => (
              <div key={i.id} className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{i.channel.name}</Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(i.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="mt-3 grid gap-2">
                  <div>
                    <div className="text-xs font-semibold text-gray-600">Topic</div>
                    <div className="text-sm">{i.topic}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-600">Hook</div>
                    <div className="text-sm">{i.hook}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-600">Title</div>
                    <div className="text-sm font-semibold">{i.title}</div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-600">Thumbnail text</div>
                    <div className="text-sm">{i.thumbnail}</div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <form action={enqueueThumbnailJob}>
                        <input type="hidden" name="ideaId" value={i.id} />
                        <ProButton type="submit" variant="secondary">
                        Generate Thumbnail
                        </ProButton>
                    </form>

                    {i.thumbnailUrl ? (
                        <a
                        className="text-sm font-semibold underline"
                        href={i.thumbnailUrl}
                        target="_blank"
                        rel="noreferrer"
                        >
                        View PNG
                        </a>
                    ) : (
                        <span className="text-sm text-gray-500">No thumbnail yet</span>
                    )}
                    </div>

                    {i.thumbnailUrl ? (
                    <div className="mt-3 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={i.thumbnailUrl} alt="Generated thumbnail" className="w-full" />
                    </div>
                    ) : null}

                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
