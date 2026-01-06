import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

function NavItem({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="group block rounded-2xl border border-[hsl(var(--border))] bg-white px-4 py-3 transition hover:-translate-y-[1px] hover:shadow-sm"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold">{title}</div>
        <span className="text-xs text-gray-500 group-hover:text-gray-700">
          →
        </span>
      </div>
      <div className="mt-1 text-xs text-gray-600">{desc}</div>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Top bar */}
        <header className="flex items-center justify-between gap-3 rounded-3xl border border-[hsl(var(--border))] bg-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-black text-sm font-extrabold text-white">
              YG
            </div>
            <div>
              <div className="text-base font-bold leading-tight">YouGrow</div>
              <div className="text-xs text-gray-600">
                Creator Studio
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-2xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm font-semibold hover:bg-gray-50"
            >
              Home
            </Link>
          </div>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold">Navigation</div>
              <div className="mt-1 text-xs text-gray-600">
                Start with adding channel → then generate ideas.
              </div>

              <div className="mt-4 grid gap-3">
                <NavItem
                  href="/dashboard"
                  title="Overview"
                  desc="KPIs, recent activity, and status."
                />
                <NavItem
                  href="/dashboard/channel"
                  title="Channel"
                  desc="Add a channel and fetch recent uploads."
                />
                <NavItem
                  href="/dashboard/ideas"
                  title="Ideas"
                  desc="Generate hooks, titles, and thumbnails."
                />
              </div>
            </div>

            <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-sm">
              <div className="text-sm font-semibold">Content</div>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>• Add your YouTube channel</li>
                <li>• Generate video ideas & hooks</li>
                <li>• AI-assisted titles & thumbnails</li>
                <li>• Fast insights from your own ideas</li>
              </ul>
            </div>
          </aside>

          {/* Main */}
          <main className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
