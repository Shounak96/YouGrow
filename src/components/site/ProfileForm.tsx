"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import { ProButton } from "@/components/ui/pro-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Initial = {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
};

export function ProfileForm({ initial }: { initial: Initial }) {
  const [form, setForm] = useState<Initial>(initial);
  const [loading, setLoading] = useState(false);

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(initial), [form, initial]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          firstName: form.firstName,
          lastName: form.lastName,
        }),
      });

      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Failed to update profile.");
        return;
      }

      toast.success("Profile updated.");
      // refresh UI: easiest is just reload current route
      window.location.reload();
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function onCancel() {
    setForm(initial);
    toast.message("Changes discarded.");
  }

  return (
    <form onSubmit={onSave} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Name</Label>
          <Input
            id="firstName"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            placeholder="Shounak"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Surname</Label>
          <Input
            id="lastName"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            placeholder="Powar"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="shounak.powar"
          />
          <p className="text-xs text-gray-500">
            Unique. Letters, numbers, <span className="font-medium">_</span> and{" "}
            <span className="font-medium">.</span> only.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={form.email} readOnly />
          <p className="text-xs text-gray-500">
            Email change will be added later (requires verification).
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <ProButton type="button" variant="secondary" onClick={onCancel} disabled={!dirty || loading}>
          Cancel
        </ProButton>
        <ProButton type="submit" disabled={!dirty || loading}>
          {loading ? "Saving..." : "Save changes"}
        </ProButton>
      </div>
    </form>
  );
}
