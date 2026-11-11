import type { ReactElement } from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@harmony/ui/components/tooltip";

type TipProps = {
  label: string;
  children: ReactElement;
};

export const Tip = ({ label, children }: TipProps) => (
  <Tooltip>
    <TooltipTrigger render={children} />
    <TooltipContent>{label}</TooltipContent>
  </Tooltip>
);
