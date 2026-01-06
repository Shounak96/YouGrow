"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ProButton } from "@/components/ui/pro-button";

export function GoogleSignInButton() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/dashboard";

  return (
    <ProButton
      className="w-full"
      variant="secondary"
      onClick={async () => {
        try {
          await signIn("google", { callbackUrl: next });
        } catch {
          toast.error("Google sign-in failed");
        }
      }}
    >
      Continue with Google
    </ProButton>
  );
}
