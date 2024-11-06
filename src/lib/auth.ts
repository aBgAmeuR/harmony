import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Spotify from "next-auth/providers/spotify";

import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Spotify({
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-email%20user-top-read"
    })
  ]
});
