import { auth } from "@repo/auth";

import { AppHeader } from "~/components/app-header";

export default async function SettingsAboutPage() {
  const session = await auth();

  return (
    <>
      <AppHeader items={["Settings", "About"]} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <pre>{JSON.stringify(session, null, 2)}</pre>
      </div>
    </>
  );
}
