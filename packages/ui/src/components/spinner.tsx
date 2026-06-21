import { Icon, Loading03Icon } from "@harmony/icons";
import { cn } from "@harmony/ui/lib/utils";

function Spinner({ className, strokeWidth = 2, ...props }: React.ComponentProps<"svg">) {
  return (
    <Icon
      strokeWidth={Number(strokeWidth)}
      icon={Loading03Icon}
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  );
}

export { Spinner };
