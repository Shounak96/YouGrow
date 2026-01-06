// src/lib/analytics.ts

export function dayKey(d: Date) {
  // local day key: YYYY-MM-DD
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${da}`;
}

export function lastNDaysKeys(n: number) {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    keys.push(dayKey(d));
  }
  return keys;
}

export function countByDay(items: { createdAt: Date }[], days: number) {
  const keys = lastNDaysKeys(days);
  const map = new Map<string, number>(keys.map((k) => [k, 0]));

  for (const it of items) {
    const k = dayKey(it.createdAt);
    if (map.has(k)) map.set(k, (map.get(k) ?? 0) + 1);
  }

  return keys.map((k) => ({ day: k, count: map.get(k) ?? 0 }));
}

export function topNStrings(values: string[], n: number) {
  const freq = new Map<string, number>();
  for (const raw of values) {
    const v = String(raw || "").trim();
    if (!v) continue;
    freq.set(v, (freq.get(v) ?? 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([label, count]) => ({ label, count }));
}

export function jobStatusCounts(jobs: { status: string }[]) {
  const counts = { queued: 0, running: 0, done: 0, failed: 0, other: 0 };
  for (const j of jobs) {
    const s = (j.status || "").toLowerCase();
    if (s === "queued") counts.queued++;
    else if (s === "running") counts.running++;
    else if (s === "done") counts.done++;
    else if (s === "failed") counts.failed++;
    else counts.other++;
  }
  return counts;
}

export function percent(n: number, d: number) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

export function groupCount<T extends string | number>(
  values: T[]
) {
  const map = new Map<T, number>();
  for (const v of values) {
    map.set(v, (map.get(v) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count }));
}

export function extractHookPattern(hook: string) {
  const h = hook.toLowerCase();

  if (h.startsWith("i tried")) return "I tried …";
  if (h.startsWith("stop")) return "Stop doing …";
  if (h.startsWith("most creators")) return "Most creators …";
  if (h.startsWith("the fastest way")) return "The fastest way …";
  if (h.startsWith("i wish i knew")) return "I wish I knew …";

  return "Other";
}

