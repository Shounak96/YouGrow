import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

import { ProButton } from "@/components/ui/pro-button";
import { UserMenu } from "@/components/site/UserMenu";

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="flex h-10 items-center gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white px-3 py-2 shadow-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black text-xs font-bold text-white">
          YG
        </div>

        <div className="leading-tight">
          <div className="text-sm font-semibold text-gray-900">YouGrow</div>
          <div className="text-[11px] text-gray-500">
            Creator Studio
          </div>
        </div>
      </div>
    </Link>
  );
}

export async function Header() {
  const session = await auth();
  const sessionUser = session?.user;

  // Not logged in
  if (!sessionUser) {
    return (
      <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Brand />
          <Link href="/login?next=/dashboard">
            <ProButton variant="secondary">Login</ProButton>
          </Link>
        </div>
      </header>
    );
  }

  // Logged in → fetch latest user from DB (so profile edits reflect instantly)
  const userId = (sessionUser as any).id as string | undefined;

  const dbUser = userId
    ? await prisma.user.findUnique({
        where: { id: userId },
        select: {
          name: true,
          email: true,
          image: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      })
    : null;

  const displayName =
    dbUser?.name ??
    ([dbUser?.firstName, dbUser?.lastName].filter(Boolean).join(" ") ||
      sessionUser.name ||
      "Account");

  const displayEmail = dbUser?.email ?? sessionUser.email ?? undefined;
  const displayImage = dbUser?.image ?? (sessionUser as any).image ?? undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
        <Brand />
        <UserMenu name={displayName} email={displayEmail} image={displayImage} />
      </div>
    </header>
  );
}
