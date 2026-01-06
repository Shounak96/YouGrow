"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { toast } from "sonner";
import { ProButton } from "@/components/ui/pro-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignupForm({ nextUrl }: { nextUrl: string }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <form
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            username,
            password,
          }),
        });

        setLoading(false);

        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          toast.error(j?.error || "Signup failed");
          return;
        }

        toast.success("Account created. Signing you in...");

        // Auto-login with credentials after signup
        const login = await signIn("credentials", {
          identifier: username || email,
          password,
          callbackUrl: nextUrl,
          redirect: false,
        });

        if (login?.error) {
          toast.error("Account created, but login failed. Please sign in.");
          window.location.href = `/login?next=${encodeURIComponent(nextUrl)}`;
          return;
        }

        window.location.href = login?.url || nextUrl;
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>First name</Label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Last name</Label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Email</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <Label>Username</Label>
        <Input
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          placeholder="yourhandle"
          autoComplete="username"
        />
      </div>

      <div className="space-y-2">
        <Label>Password (min 6 chars)</Label>
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          type="password"
          autoComplete="new-password"
        />
      </div>

      <ProButton className="w-full" disabled={loading}>
        {loading ? "Creating..." : "Create account"}
      </ProButton>
    </form>
  );
}
