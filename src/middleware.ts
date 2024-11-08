import NextAuth from "next-auth";

import authConfig from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);
export default auth(async (req) => {
  if (!req.auth && req.nextUrl.pathname !== "/") {
    const newUrl = new URL("/api/login", req.nextUrl.origin);
    newUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);

    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
