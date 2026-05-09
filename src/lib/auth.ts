import { NextAuthOptions, getServerSession } from "next-auth";
import { useSession as useNextAuthSession } from "next-auth/react";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

function getAdapter() {
  return PrismaAdapter(prisma) as NextAuthOptions["adapter"];
}

export const authOptions: NextAuthOptions = {
  get adapter() {
    return getAdapter();
  },
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
      if (user && session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
};

export const getAuthSession = () => getServerSession(authOptions);

export const useSession = useNextAuthSession;
