import { Suspense } from "react";
import { auth } from "@repo/auth";

import { AppHeader } from "~/components/app-header";

import { Client } from "./client";
import { PackageHistoryUpload } from "./package-history-upload";

export default async function SettingsPackagePage() {
  const session = await auth();
  const isDemo = session?.user?.name === "Demo";
  const hasPackage = session?.user?.hasPackage;

  return (
    <>
      <AppHeader items={["Settings", "Package"]} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-4 pt-0">
        <Client isDemo={isDemo} hasPackage={hasPackage}>
          <Suspense fallback={null}>
            <PackageHistoryUpload />
          </Suspense>
        </Client>
      </div>
    </>
  );
}
