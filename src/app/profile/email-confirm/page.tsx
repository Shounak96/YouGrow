import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function EmailConfirmPage(props: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await props.searchParams;

  if (!token) redirect("/profile?email=missing_token");

  const user = await prisma.user.findFirst({
  where: {
    emailChangeToken: token,
    emailChangeExpires: { gt: new Date() },
  },
});


  if (!user || !user.pendingEmail || !user.emailChangeExpires) {
    redirect("/profile?email=invalid_token");
  }

  if (user.emailChangeExpires.getTime() < Date.now()) {
    redirect("/profile?email=expired");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: user.pendingEmail,
      pendingEmail: null,
      emailChangeToken: null,
      emailChangeExpires: null,
    },
  });

  // Force re-login so session refreshes with new email
  redirect("/login?next=/profile&email=updated");
}
