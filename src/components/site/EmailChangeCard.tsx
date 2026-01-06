"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProButton } from "@/components/ui/pro-button";
import { toast } from "sonner";

function isValidEmail(x: string) {
  const v = x.trim().toLowerCase();
  return v.length >= 6 && v.includes("@") && v.includes(".");
}

export function EmailChangeCard({
  currentEmail,
  pendingEmail,
  isOAuthUser,
}: {
  currentEmail: string;
  pendingEmail: string | null;
  isOAuthUser: boolean;
}) {
  const router = useRouter();
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const disabled = isOAuthUser;

  const helper = useMemo(() => {
    if (isOAuthUser) {
      return "Email is managed by Google sign-in and can’t be changed here.";
    }
    if (pendingEmail) {
      return `Pending change: ${pendingEmail}. Confirm via the verification link sent to that email.`;
    }
    return "We’ll send a verification link to your new email to confirm the change.";
  }, [isOAuthUser, pendingEmail]);

  async function requestChange() {
    const email = newEmail.trim().toLowerCase();

    if (!isValidEmail(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    if (email === currentEmail.trim().toLowerCase()) {
      toast.error("That’s already your current email.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/profile/email/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: email }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        toast.error(data?.error ?? "Could not request email change.");
        return;
      }

      toast.success("Verification link sent. Check your email (or server console in dev).");
      setNewEmail("");
      // Refresh server component data (pendingEmail)
      router.refresh();
    } catch (e: any) {
      toast.error(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Email</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label>Current email</Label>
          <Input value={currentEmail} readOnly />
        </div>

        <div className="grid gap-2">
          <Label>New email</Label>
          <Input
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="name@example.com"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">{helper}</p>
        </div>

        <div className="flex items-center gap-2">
          <ProButton onClick={requestChange} disabled={disabled || loading}>
            {loading ? "Sending..." : "Send verification link"}
          </ProButton>

          {disabled ? (
            <span className="text-xs text-muted-foreground">
              Signed in with Google
            </span>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
