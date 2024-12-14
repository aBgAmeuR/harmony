import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Spotify from "next-auth/providers/spotify";

export default {
  providers: [
    Spotify({
      authorization:
        "https://accounts.spotify.com/authorize?scope=user-read-recently-played%20user-top-read%20user-read-email",
    }),
    Credentials({
      name: "Demo",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (
          credentials.username === "demo" &&
          credentials.password === "demo"
        ) {
          return {
            name: "Demo",
            id: process.env.DEMO_ID,
            hasPackage: true,
          };
        }
        return null;
      },
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
