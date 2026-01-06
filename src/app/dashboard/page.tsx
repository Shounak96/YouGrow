import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProButton } from "@/components/ui/pro-button";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

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

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard");

  const userId = session.user.id;

  const [channelsCount, jobsCount] = await Promise.all([
    prisma.channel.count({ where: { userId } }),
    prisma.job.count({ where: { userId } }),
  ]);

  const latestChannel = await prisma.channel.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* everything below stays the same */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Overview</h2>
          </div>
        </div>

        <div className="flex gap-2">
          <Link href="/dashboard/channel">
            <ProButton>Connect Channel</ProButton>
          </Link>
          <Link href="/dashboard/ideas">
            <ProButton variant="secondary">Generate Ideas</ProButton>
          </Link>
          <Link href="/dashboard/insights">
            <ProButton variant="secondary">Insights</ProButton>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Channels"
          value={String(channelsCount)}
          hint={channelsCount === 0 ? "Add your first channel" : "Connected"}
        />
        <Stat label="Snapshots" value="0" hint="Coming next" />
        <Stat label="Jobs" value={String(jobsCount)} hint="Queued / running / done" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent activity</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            {latestChannel ? (
              <div className="space-y-2">
                <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                  <div className="font-semibold">
                    Added channel: {latestChannel.name}
                  </div>
                  <div className="text-xs text-gray-600">{latestChannel.url}</div>
                </div>
                <div className="text-xs text-gray-500">
                  Add more channels to see them listed here.
                </div>
              </div>
            ) : (
              "Nothing yet. Add a channel to start tracking activity."
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Creator Focus</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                <span>Primary goal</span>
                <span className="text-xs font-semibold text-gray-900">
                  Idea-driven growth
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                <span>Content style</span>
                <span className="text-xs font-semibold text-gray-900">
                  Shorts & long-form
                </span>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] px-3 py-2">
                <span>Workflow</span>
                <span className="text-xs font-semibold text-gray-700">
                  Ideas → Analyze → Improve
                </span>
              </div>
            </div>
          </CardContent>
        </Card>


      </div>
    </div>
  );
}

