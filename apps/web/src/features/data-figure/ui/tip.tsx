import type { ReactElement } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";

type TipProps = {
  label: string;
  // The button the tip names, which keeps its own content.
  children: ReactElement;
};

// Names an icon button on hover and focus.
export const Tip = ({ label, children }: TipProps) => (
  <Tooltip>
    <TooltipTrigger render={children} />
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);
