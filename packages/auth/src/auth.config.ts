import type { NextAuthConfig } from "next-auth";
import Spotify from "next-auth/providers/spotify";

export default {
  providers: [
    Spotify({
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-recently-played%20user-top-read%20user-read-email",
    }),
  ],
  callbacks: {
    authorized: async ({ auth }) => {
      // Logged in users are authenticated, otherwise redirect to login page
      return !!auth;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
        token.hasPackage = user.hasPackage;
      }
      return token;
    },
    session: async ({ session, token }) => {
      session.user.id = token.id as string;
      session.user.hasPackage = token.hasPackage as boolean;
      return session;
    },
  },
  pages: {
    error: "/error",
  },
} satisfies NextAuthConfig;
