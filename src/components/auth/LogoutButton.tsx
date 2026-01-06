"use client";

import { signOut } from "next-auth/react";
import { ProButton } from "@/components/ui/pro-button";

export function LogoutButton() {
  return (
    <ProButton
      variant="secondary"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      Logout
    </ProButton>
  );
}
