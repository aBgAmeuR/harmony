import { signIn } from "@repo/auth";

export async function GET() {
  return await signIn("credentials", {
    username: "demo",
    password: "demo",
    redirect: true,
    redirectTo: "/overview",
  });
}
