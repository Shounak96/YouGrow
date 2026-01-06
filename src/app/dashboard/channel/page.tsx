import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProButton } from "@/components/ui/pro-button";
import { prisma } from "@/lib/db";
import type { Channel } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

async function createChannel(formData: FormData) {
  "use server";

  const session = await auth();
  const userId = (session?.user as any)?.id as string | undefined;

  if (!userId) {
    // ✅ don't redirect from a server action (causes exactly what you're seeing)
    return;
  }

  const name = String(formData.get("name") || "").trim();
  const url = String(formData.get("url") || "").trim();
  if (!name || !url) return;

  await prisma.channel.create({
    data: { name, url, userId }, // ✅ REQUIRED
  });

  revalidatePath("/dashboard/channel");
}



export default async function ChannelPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/dashboard/channel");

  const userId = (session.user as any).id as string | undefined;
  if (!userId) redirect("/login?next=/dashboard/channel");

  const channels: Channel[] = await prisma.channel.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Channel</h2>
        <p className="mt-1 text-sm text-gray-600">
          Add a channel to start storing insights and generating ideas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add a channel</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createChannel} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-semibold">Channel name</label>
              <input
                name="name"
                placeholder="e.g., MrBeast"
                className="w-full rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold">Channel URL</label>
              <input
                name="url"
                placeholder="https://www.youtube.com/@handle"
                className="w-full rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="sm:col-span-2">
              <ProButton type="submit">Save Channel</ProButton>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Connected channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {channels.length === 0 ? (
            <div className="text-sm text-gray-600">
              No channels yet. Add one above.
            </div>
          ) : (
            channels.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3"
              >
                <div>
                  <div className="font-semibold">{c.name}</div>
                  <div className="text-xs text-gray-600">{c.url}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
