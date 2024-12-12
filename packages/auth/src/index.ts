import { handlers, signIn, signOut, auth } from "./auth";
import NextAuth from "next-auth";

import authConfig from "./auth.config";

const middleware = NextAuth(authConfig).auth(async (req) => {
  // eslint-disable-next-line turbo/no-undeclared-env-vars
  if (process.env.APP_MAINTENANCE === 'true' && req.nextUrl.pathname !== "/") {
    const newUrl = new URL("/", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
  

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