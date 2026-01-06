import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EmailChangeCard } from "@/components/site/EmailChangeCard";
import { ProfileForm } from "@/components/site/ProfileForm";
import { AvatarCard } from "@/components/site/AvatarCard";
import { SecurityCard } from "@/components/site/SecurityCard";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?next=/profile");

  const id = (session.user as any).id as string | undefined;
  if (!id) redirect("/login?next=/profile");

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      firstName: true,
      lastName: true,
      passwordHash: true,
      pendingEmail: true,
      image: true, // ✅ add
      accounts: { select: { id: true } },
    },
  });

  if (!user) redirect("/login?next=/profile");


  const hasPassword = Boolean(user.passwordHash); // credentials user if true
  const isOAuthUser = (user?.accounts?.length ?? 0) > 0;


  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Profile</h1>
            <Badge variant="secondary">Account</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Update your profile details and security settings.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          <AvatarCard
            name={
                user.name ??
                    (
                        `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || "User"
                    )
                }
            email={user.email ?? ""}
            image={user.image}
          />
          <SecurityCard hasPassword={hasPassword} />
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Basic information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProfileForm
                initial={{
                  username: user.username ?? "",
                  firstName: user.firstName ?? "",
                  lastName: user.lastName ?? "",
                  email: user.email ?? "",
                }}
              />

              <Separator />

              <EmailChangeCard
                currentEmail={user.email ?? ""}
                pendingEmail={user.pendingEmail ?? null}
                isOAuthUser={isOAuthUser}
               />

              <div className="text-xs text-gray-500">
                Tip: Your email is used for login and notifications.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
