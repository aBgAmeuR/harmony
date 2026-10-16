import { Icon, Loading03Icon } from "@harmony/icons";

export const Loader = () => (
  <div className="flex h-full items-center justify-center pt-8">
    <Icon icon={Loading03Icon} className="size-4 animate-spin" />
  </div>
);
