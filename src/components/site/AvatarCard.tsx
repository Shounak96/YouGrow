"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ProButton } from "@/components/ui/pro-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function initials(name?: string | null, email?: string | null) {
  const base = (name || email || "User").trim();
  const parts = base.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("");
}

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function AvatarCard({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image?: string | null;
}) {
  const router = useRouter();

  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(image ?? null);
  const [loading, setLoading] = useState(false);

  const hint = useMemo(() => {
    return "Upload a photo (recommended) or paste an image URL. Stored in your account.";
  }, []);

  async function saveAvatar(newImage: string) {
    setLoading(true);
    try {
      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: newImage }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data?.error ?? "Could not update photo.");
        return;
      }
      toast.success("Profile photo updated.");
      router.refresh(); // refresh server components (header/profile)
    } catch (e: any) {
      toast.error(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // basic validations
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    if (file.size > 900_000) {
      toast.error("Please use an image under ~900KB.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      setPreview(dataUrl);
      await saveAvatar(dataUrl);
    } catch (err: any) {
      toast.error(String(err?.message ?? err));
    } finally {
      e.target.value = "";
    }
  }

  async function onSaveUrl() {
    const v = url.trim();
    if (!isValidUrl(v)) {
      toast.error("Enter a valid http(s) image URL.");
      return;
    }
    setPreview(v);
    await saveAvatar(v);
    setUrl("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Profile photo</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={preview ?? undefined} alt={name ?? "User"} />
            <AvatarFallback className="text-sm font-bold">
              {initials(name, email)}
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0">
            <div className="truncate text-sm font-semibold">{name}</div>
            <div className="truncate text-xs text-muted-foreground">{email}</div>
            <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
          </div>
        </div>

        <div className="grid gap-2">
          <Label>Upload</Label>
          <Input type="file" accept="image/*" onChange={onPickFile} disabled={loading} />
          <p className="text-xs text-muted-foreground">
            JPG/PNG/WebP recommended.
          </p>
        </div>

        <div className="grid gap-2">
          <Label>Or use image URL</Label>
          <div className="flex gap-2">
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              disabled={loading}
            />
            <ProButton type="button" onClick={onSaveUrl} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </ProButton>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
