export function safeNext(next?: string | null) {
  if (!next) return "/";
  // allow only internal paths
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  return next;
}
