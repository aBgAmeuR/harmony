import { Suspense } from "react";

import { AppHeader } from "~/components/app-header";

import { PackageDocumentation } from "./package-documentation";
import { PackageHistoryUpload } from "./package-history-upload";
import { PackageUpload } from "./package-upload";

export default function SettingsPackagePage() {
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
