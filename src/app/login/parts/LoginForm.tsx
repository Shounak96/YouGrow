"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ProButton } from "@/components/ui/pro-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ nextUrl }: { nextUrl: string }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await signIn("credentials", {
          identifier,
          password,
          callbackUrl: nextUrl,
          redirect: false,
        });

        setLoading(false);

        if (res?.error) {
          toast.error("Invalid email/username or password");
          return;
        }

        // signIn succeeded; redirect manually
        window.location.href = res?.url || nextUrl;
      }}
    >
      <div className="space-y-2">
        <Label>Email or Username</Label>
        <Input
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="you@example.com or username"
          autoComplete="username"
        />
      </div>

      <div className="space-y-2">
        <Label>Password</Label>
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
          autoComplete="current-password"
        />
      </div>

      <ProButton className="w-full" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </ProButton>
    </form>
  );
}
