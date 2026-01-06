import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoginForm } from "./parts/LoginForm";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { safeNext } from "@/lib/nextUrl";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await auth();
  const sp = await searchParams;
  const next = safeNext(sp.next);

  if (session?.user) {
    redirect(next || "/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto flex min-h-screen max-w-md items-center px-6 py-14">
        <Card className="w-full rounded-2xl">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome back</CardTitle>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to YouGrow.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <GoogleSignInButton />

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <LoginForm nextUrl={next || "/dashboard"} />

            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link className="underline" href={`/signup?next=${encodeURIComponent(next || "/dashboard")}`}>
                Sign up
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
