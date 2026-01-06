"use client";

import { useState } from "react";
import { ProButton } from "@/components/ui/pro-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirm &&
    !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/profile/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setMsg({ type: "err", text: data.error ?? "Failed to update password." });
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
      setMsg({ type: "ok", text: "Password updated successfully." });
    } catch {
      setMsg({ type: "err", text: "Network error. Try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="current">Current password</Label>
        <Input
          id="current"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="new">New password</Label>
          <Input
            id="new"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
          <p className="text-xs text-gray-500">
            Minimum 8 characters (we’ll add strength meter later).
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Re-type new password"
          />
          {confirm.length > 0 && confirm !== newPassword && (
            <p className="text-xs text-red-600">Passwords don’t match.</p>
          )}
        </div>
      </div>

      {msg && (
        <div
          className={
            "rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm " +
            (msg.type === "ok" ? "text-emerald-700" : "text-red-600")
          }
        >
          {msg.text}
        </div>
      )}

      <div className="flex justify-end">
        <ProButton type="submit" disabled={!canSubmit}>
          {loading ? "Saving..." : "Save password"}
        </ProButton>
      </div>
    </form>
  );
}
