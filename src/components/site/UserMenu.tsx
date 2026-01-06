"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || "User").trim();
  const parts = base.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

export function UserMenu({
  name,
  email,
  image,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-white px-2 py-1.5 shadow-sm transition hover:bg-gray-50">
          <Avatar className="h-8 w-8">
            <AvatarImage src={image ?? undefined} alt={name ?? "User"} />
            <AvatarFallback className="text-xs font-bold">
              {initials(name, email)}
            </AvatarFallback>
          </Avatar>

          <div className="hidden text-left leading-tight sm:block">
            <div className="text-sm font-semibold text-gray-900">
              {name || email || "Account"}
            </div>
            <div className="text-[11px] text-gray-500">Account</div>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="space-y-1">
          <div className="text-sm font-semibold">{name || "Signed in"}</div>
          {email ? <div className="text-xs text-muted-foreground">{email}</div> : null}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
