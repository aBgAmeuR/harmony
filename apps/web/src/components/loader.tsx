import { Icon, Loading02Icon } from "@harmony/icons";

export default function Loader() {
  return (
    <div className="flex h-full items-center justify-center pt-8">
      <Icon icon={Loading02Icon} className="animate-spin" />
    </div>
  );
}
