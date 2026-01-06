import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SignupForm } from "./parts/SignupForm";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { safeNext } from "@/lib/nextUrl";

export default async function SignupPage({
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
            <CardTitle className="text-2xl">Create your account</CardTitle>
            <p className="text-sm text-muted-foreground">
              Start using YouGrow in under a minute.
            </p>
          </CardHeader>

          <CardContent className="space-y-4">
            <GoogleSignInButton />

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">or</span>
              <Separator className="flex-1" />
            </div>

            <SignupForm nextUrl={next || "/onboarding"} />

            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link className="underline" href={`/login?next=${encodeURIComponent(next || "/dashboard")}`}>
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
