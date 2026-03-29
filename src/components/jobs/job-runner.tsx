"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export function JobRunner() {
  const router = useRouter();
  const [status, setStatus] = useState("Idle");
  const [isPolling, setIsPolling] = useState(false);
  const running = useRef(false);

  useEffect(() => {
    const checkPageForPendingJobs = () => {
      const pageText = document.body.innerText.toLowerCase();
      return pageText.includes("status: queued") || pageText.includes("status: running");
    };

    const maybeStartPolling = () => {
      const hasPendingJobs = checkPageForPendingJobs();
      setIsPolling(hasPendingJobs);

      if (hasPendingJobs) {
        setStatus("Watching queue...");
      } else {
        setStatus("Idle");
      }
    };

    maybeStartPolling();

    const observer = new MutationObserver(() => {
      maybeStartPolling();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isPolling) return;

    const id = setInterval(async () => {
      if (running.current) return;
      running.current = true;

      try {
        const res = await fetch("/api/jobs/run", {
          method: "POST",
          cache: "no-store",
        });

        if (!res.ok) {
          setStatus("Worker error");
          return;
        }

        const data = await res.json();
        const results: string[] = Array.isArray(data?.results) ? data.results : [];

        const processedSomething = results.some((r) => r !== "No queued jobs.");

        if (processedSomething) {
          setStatus("Processing...");
          router.refresh();
        } else {
          const pageText = document.body.innerText.toLowerCase();
          const stillPending =
            pageText.includes("status: queued") || pageText.includes("status: running");

          if (stillPending) {
            setStatus("Waiting...");
          } else {
            setStatus("Idle");
            setIsPolling(false);
          }
        }
      } catch {
        setStatus("Worker error");
      } finally {
        running.current = false;
      }
    }, 3000);

    return () => clearInterval(id);
  }, [isPolling, router]);

  return (
    <div className="text-xs text-gray-500">
      Background worker: <span className="font-semibold">{status}</span>
    </div>
  );
}