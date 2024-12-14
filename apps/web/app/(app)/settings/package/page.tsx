import { Suspense } from "react";
import { auth } from "@repo/auth";
import { signOut } from "@repo/auth/actions";
import { Button } from "@repo/ui/button";
import { Info } from "lucide-react";

import { AppHeader } from "~/components/app-header";

import { PackageDocumentation } from "./package-documentation";
import { PackageHistoryUpload } from "./package-history-upload";
import { PackageUpload } from "./package-upload";

export default async function SettingsPackagePage() {
  const session = await auth();

  if (session?.user?.name === "Demo") {
    return (
      <>
        <AppHeader items={["Settings", "Package"]} />
        <div className="flex flex-1 flex-col items-center gap-4 p-4 pt-0">
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border border-border bg-background p-4 shadow-lg shadow-black/5">
              <div className="flex items-center gap-4">
                <Info
                  className="text-blue-500"
                  size={24}
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <div className="flex grow items-center justify-between w-full">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      Sign in to view your package
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You must sign in to view your package and explore your
                      listening history with Harmony.
                    </p>
                  </div>
                  <form
                    action={async () => {
                      "use server";
                      await signOut({
                        redirect: true,
                        redirectTo: "/",
                      });
                    }}
                  >
                    <Button className="w-full" size="sm" type="submit">
                      Exit demo
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            <PackageDocumentation />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AppHeader items={["Settings", "Package"]} />
      <div className="flex flex-1 flex-col items-center gap-4 p-4 pt-0">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4">
            <PackageUpload />
            <PackageDocumentation />
          </div>
          <Suspense fallback={null}>
            <PackageHistoryUpload />
          </Suspense>
        </div>
      </div>
    </>
  );
}
