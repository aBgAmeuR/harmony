import { Icon, Loading03Icon } from "@harmony/icons";

import { AppFooter } from "./footer";

export const AppPending = () => (
  <div className="relative flex min-h-screen items-center justify-center">
    <div className="flex flex-col items-center justify-center gap-2">
      <Icon icon={Loading03Icon} className="size-4 animate-spin" />
      <span className="text-sm font-medium">Setup your database</span>
    </div>

    <AppFooter />
  </div>
);
