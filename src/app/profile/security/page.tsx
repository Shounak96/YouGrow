import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChangePasswordForm } from "@/components/site/ChangePasswordForm";

export default async function SecurityPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/profile/security");

  const userId = (session.user as any).id as string | undefined;
  if (!userId) redirect("/login?next=/profile/security");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true, email: true },
  });

  if (!user) redirect("/login?next=/profile/security");

  const hasPassword = Boolean(user.passwordHash);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold">Security</h1>
          <Badge variant="secondary">Password</Badge>
        </div>
        <p className="mt-1 text-sm text-gray-600">
          Update your password and keep your account secure.
        </p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Change password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasPassword ? (
            <div className="rounded-xl border border-[hsl(var(--border))] bg-white p-4 text-sm text-gray-700">
              You signed in with Google. Your password is managed by Google.
            </div>
          ) : (
            <>
              <ChangePasswordForm />
              <Separator />
              <div className="text-xs text-gray-500">
                Tip: Use a long password you don’t reuse anywhere else.
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
