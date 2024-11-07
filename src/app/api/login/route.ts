import { signIn } from "@/lib/auth";

export async function GET(req: Request) {
  const searchParams = new URL(req.url).searchParams;

  return signIn("spotify", {
    redirectTo: searchParams.get("callbackUrl") ?? ""
  });
}
