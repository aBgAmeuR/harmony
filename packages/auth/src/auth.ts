/* eslint-disable no-unused-vars */
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession } from "next-auth";

import { prisma } from "@repo/database";
import authConfig from "./auth.config";

 
declare module "next-auth" {
  interface Session {
    user: {
      hasPackage: boolean;
    } & DefaultSession["user"]
  }

  interface User {
    hasPackage?: boolean;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt"
  },
  ...authConfig
});
