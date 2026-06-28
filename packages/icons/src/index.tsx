import type { HugeiconsIconProps } from "@hugeicons/react";

import { HugeiconsIcon } from "@hugeicons/react";

export * from "@hugeicons/core-free-icons";

export function Icon({
  size = 16,
  color = "currentColor",
  strokeWidth = 1.75,
  ...rest
}: HugeiconsIconProps) {
  return <HugeiconsIcon size={size} color={color} strokeWidth={strokeWidth} {...rest} />;
}
