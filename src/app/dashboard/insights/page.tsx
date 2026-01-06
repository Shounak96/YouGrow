// src/app/dashboard/insights/page.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  countByDay,
  jobStatusCounts,
  percent,
  topNStrings,
  groupCount,
  extractHookPattern,
} from "@/lib/analytics";

import { BarMiniChart } from "@/components/insights/BarMiniChart";

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
      <div className="text-xs text-gray-600">{label}</div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-gray-500">{hint}</div>
    </div>
  );
}

export default async function InsightsPage(props: {
  searchParams?: Promise<{ range?: string }>;
}) {
  const sp = props.searchParams ? await props.searchParams : undefined;


  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard/insights");

  const userId = (session.user as any).id as string | undefined;
  if (!userId) redirect("/login?next=/dashboard/insights");

  // ✅ Only show the logged-in user's data
  const channels = await prisma.channel.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, url: true, createdAt: true },
  });

  const channelIds = channels.map((c) => c.id);

  const [ideas, jobs] = await Promise.all([
    prisma.idea.findMany({
        where: { channel: { userId } }, // ✅ only this user’s ideas
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            topic: true,
            hook: true,
            title: true,
            source: true,
            createdAt: true,
            channelId: true,
        },
        take: 500,
        }),

    prisma.job.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, status: true, type: true, createdAt: true, error: true },
      take: 500,
    }),
  ]);

  // KPIs
  const channelsCount = channels.length;
  const ideasCount = ideas.length;
  const jobsCount = jobs.length;

  const range = sp?.range === "30" ? 30 : 7;

    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(now.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const ideasLast7 = ideas.filter(
    (i) => i.createdAt >= sevenDaysAgo
    ).length;

    const since = new Date(now);
    since.setDate(now.getDate() - (range - 1));
    since.setHours(0, 0, 0, 0);

    const ideasInRange = ideas.filter((i) => i.createdAt >= since).length;


  const status = jobStatusCounts(jobs);
  const finished = status.done + status.failed;
  const successRate = percent(status.done, finished);

  // Charts
  const ideasByDay = countByDay(ideas, range).map((x) => ({
    label: x.day.slice(5), // MM-DD
    value: x.count,
  }));

  const jobsStatusData = [
    { label: "queued", value: status.queued },
    { label: "running", value: status.running },
    { label: "done", value: status.done },
    { label: "failed", value: status.failed },
  ];

  // Lists
  const topTopics = topNStrings(ideas.map((i) => i.topic), 6);

  const sourceCounts = topNStrings(
    ideas.map((i) => (i.source ? String(i.source) : "unknown")),
    3
  );

  const channelLeaderboard = groupCount(ideas.map((i) => i.channelId))
  .map((x) => ({
    channelId: x.label,
    count: x.count,
    name: channels.find((c) => c.id === x.label)?.name ?? "Unknown",
  }))
  .slice(0, 5);

  const hookPatterns = groupCount(
  ideas.map((i) => extractHookPattern(i.hook ?? ""))
    ).slice(0, 6);



  // Simple recommendations (rule-based)
  const recs: string[] = [];
  if (channelsCount === 0) recs.push("Connect at least one channel to unlock insights.");
  if (ideasLast7 === 0) recs.push("You generated 0 ideas in the last 7 days — try queuing 3 topics to get momentum.");
  if (finished >= 5 && successRate < 70) recs.push("Job success rate is low — check failed jobs in Ideas → fix errors to stabilize.");
  if (topTopics[0]) recs.push(`Your most common topic is “${topTopics[0].label}”. Consider making a series around it.`);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Insights</h2>
            <div className="mt-3 flex items-center gap-3 text-xs">
                <span className="text-gray-500">Range:</span>
                <a
                    href="/dashboard/insights?range=7"
                    className={range === 7 ? "font-semibold underline" : "underline text-gray-600"}
                >
                    7 days
                </a>
                <a
                    href="/dashboard/insights?range=30"
                    className={range === 30 ? "font-semibold underline" : "underline text-gray-600"}
                >
                    30 days
                </a>
                </div>
            <Badge variant="secondary">Phase 1 • Local DB</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Your analytics from saved channels, ideas, and background jobs.
          </p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat
          label="Channels"
          value={String(channelsCount)}
          hint={channelsCount ? "Connected" : "Add your first channel"}
        />
        <Stat
            label="Ideas"
            value={String(ideasCount)}
            hint={`${ideasInRange} in last ${range} days`}
        />

        <Stat
          label="Jobs"
          value={String(jobsCount)}
          hint={`${status.done} done • ${status.failed} failed`}
        />
        <Stat
          label="Success rate"
          value={`${successRate}%`}
          hint={finished ? "done / (done+failed)" : "No finished jobs yet"}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ideas over last {range} days</CardTitle>
          </CardHeader>
          <CardContent>
            {ideasCount === 0 ? (
              <div className="text-sm text-gray-600">
                No ideas yet. Generate ideas to see trends.
              </div>
            ) : (
              <BarMiniChart data={ideasByDay} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Job status breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {jobsStatusData.map((x) => (
                <div
                  key={x.label}
                  className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2"
                >
                  <span className="text-sm font-semibold capitalize">{x.label}</span>
                  <span className="text-sm">{x.value}</span>
                </div>
              ))}
            </div>
            <div className="pt-2">
              <BarMiniChart
                data={jobsStatusData.map((x) => ({ label: x.label, value: x.value }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="text-lg">Most common hook patterns</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {hookPatterns.length === 0 ? (
            <div className="text-sm text-gray-600">No hooks yet.</div>
            ) : (
            hookPatterns.map((h) => (
                <div
                key={h.label}
                className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2"
                >
                <span className="text-sm">{h.label}</span>
                <span className="text-xs font-semibold text-gray-700">{h.count}</span>
                </div>
            ))
            )}
        </CardContent>
      </Card>


      {/* Lists + recommendations */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Top topics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topTopics.length === 0 ? (
              <div className="text-sm text-gray-600">No topics yet.</div>
            ) : (
              topTopics.map((t) => (
                <div
                  key={t.label}
                  className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2"
                >
                  <span className="text-sm">{t.label}</span>
                  <span className="text-xs font-semibold text-gray-600">{t.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Idea sources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sourceCounts.length === 0 ? (
              <div className="text-sm text-gray-600">No ideas yet.</div>
            ) : (
              sourceCounts.map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2"
                >
                  <span className="text-sm capitalize">{s.label}</span>
                  <span className="text-xs font-semibold text-gray-600">{s.count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
            <CardHeader>
                <CardTitle className="text-lg">Channel leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {channelLeaderboard.length === 0 ? (
                <div className="text-sm text-gray-600">No ideas yet.</div>
                ) : (
                channelLeaderboard.map((c, idx) => (
                    <div
                    key={c.channelId}
                    className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2"
                    >
                    <span className="text-sm font-semibold">
                        #{idx + 1} {c.name}
                    </span>
                    <span className="text-xs text-gray-600">{c.count} ideas</span>
                    </div>
                ))
                )}
            </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Recommendations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-600">
            {recs.length === 0 ? (
              <div>Everything looks good. Generate more ideas to unlock richer insights.</div>
            ) : (
              <ul className="list-disc space-y-2 pl-5">
                {recs.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
