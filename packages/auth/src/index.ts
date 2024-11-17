import { handlers, signIn, signOut, auth } from "./auth";
import NextAuth from "next-auth";

import authConfig from "./auth.config";

const middleware = NextAuth(authConfig).auth(async (req) => {
  if (
    !req.auth &&
    req.nextUrl.pathname !== "/" &&
    !req.nextUrl.pathname.startsWith("/api/auth")
  ) {
    const newUrl = new URL("/api/login", req.nextUrl.origin);
    newUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);

    return Response.redirect(newUrl);
  }
});


export { handlers, signIn, signOut, auth, middleware };