import { cn } from "@/lib/cn";

export function Badge({
  variant = "secondary",
  className,
  children,
}: {
  variant?: "secondary" | "outline";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        variant === "secondary" &&
          "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]",
        variant === "outline" &&
          "border border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
        className
      )}
    >
      {children}
    </span>
  );
}
