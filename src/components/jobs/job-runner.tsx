"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function JobRunner() {
  const router = useRouter();
  const [status, setStatus] = useState<string>("Idle");
  const running = useRef(false);

  useEffect(() => {
    const id = setInterval(async () => {
      if (running.current) return;
      running.current = true;

      try {
        const res = await fetch("/api/jobs/run", { method: "POST" });
        const data = await res.json();

        const msg = String(data?.message ?? "Ran worker");
        setStatus(msg);

        // ✅ If we actually did something (or even checked), refresh the page
        // so Server Components re-fetch jobs/ideas from DB.
        if (!msg.toLowerCase().includes("no queued jobs")) {
          router.refresh();
        }
      } catch {
        setStatus("Worker error");
      } finally {
        running.current = false;
      }
    }, 1500); // a bit faster than 2s feels nicer

    return () => clearInterval(id);
  }, [router]);

  return (
    <div className="text-xs text-gray-500">
      Background worker: <span className="font-semibold">{status}</span>
    </div>
  );
}
