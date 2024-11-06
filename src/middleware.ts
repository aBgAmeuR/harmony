import { auth } from "@/lib/auth";

export default auth((req) => {
  console.log("ROUTE:", req.nextUrl.pathname);
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"]
};
