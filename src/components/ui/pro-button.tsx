import { cn } from "@/lib/cn";

export function ProButton({
  variant = "primary",
  className,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      {...props}
      className={cn(
        "relative overflow-hidden rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all",
        "hover:-translate-y-[1px] active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] focus-visible:ring-offset-2",
        variant === "primary" &&
          "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm hover:opacity-95",
        variant === "secondary" &&
          "bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] border border-[hsl(var(--border))] hover:bg-white",
        "before:absolute before:inset-0 before:-translate-x-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent",
        "before:transition-transform before:duration-700 hover:before:translate-x-full",
        className
      )}
    >
      {children}
    </button>
  );
}
