import React from "react";
import { Button } from "@repo/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/tooltip";
import { Info } from "lucide-react";

export const SelectTimeRangeInfo = () => {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon">
            <Info />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">
          <ul>
            <li>
              <strong className="font-mono">Long Term</strong>: calculated from
              ~1 year
            </li>
            <li>
              <strong className="font-mono">Medium Term</strong>: approximately
              last 6 months
            </li>
            <li>
              <strong className="font-mono">Short Term</strong>: approximately
              last 4 weeks
            </li>
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
