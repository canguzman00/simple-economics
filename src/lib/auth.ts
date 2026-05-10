import { NextAuthOptions, getServerSession } from "next-auth";
import { useSession as useNextAuthSession } from "next-auth/react";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "database",
  },
  pages: {
    signIn: "/signin",
  },
  callbacks: {
    async session({ session, user }) {
      try {
        if (user && session.user) {
          session.user.id = user.id;
        }
      } catch (err) {
        console.error("[auth] session callback error:", err);
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      console.log("[auth] signIn", { userId: user.id, provider: account?.provider, isNewUser });
    },
    async createUser({ user }) {
      console.log("[auth] createUser", { userId: user.id, email: user.email });
    },
    async session({ session }) {
      console.log("[auth] session refreshed", { userId: (session.user as { id?: string })?.id });
    },
  },
  debug: process.env.NODE_ENV === "development",
};

export const getAuthSession = () => getServerSession(authOptions);

export const useSession = useNextAuthSession;
