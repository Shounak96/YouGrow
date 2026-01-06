import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    Credentials({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier || "").toLowerCase().trim();
        const password = String(credentials?.password || "");

        if (!identifier || !password) return null;

        const user = await prisma.user.findFirst({
          where: { OR: [{ email: identifier }, { username: identifier }] },
        });

        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // ✅ MUST include id so JWT can carry it
        return { id: user.id, email: user.email, name: user.name ?? undefined };
      },
    }),
  ],

  pages: { signIn: "/login" },

  // ✅ ADD THIS
  callbacks: {
  async jwt({ token, user }) {
    // user exists on first sign-in only
    if (user) {
      (token as any).id = (user as any).id;
      token.email = user.email;
      token.name = user.name;
    }
    return token;
  },

  async session({ session, token }) {
    if (!session.user?.email) return session;

    // 1) keep id from token (good for APIs)
    (session.user as any).id = (token as any).id;

    // 2) ALWAYS pull latest profile fields from DB (name + image)
    const dbUser = await prisma.user.findUnique({
      where: { email: String(session.user.email).toLowerCase().trim() },
      select: { id: true, name: true, image: true },
    });

    if (dbUser) {
      (session.user as any).id = dbUser.id;
      session.user.name = dbUser.name ?? session.user.name;
      (session.user as any).image = dbUser.image ?? (session.user as any).image;
    }

    return session;
  },
},

});
