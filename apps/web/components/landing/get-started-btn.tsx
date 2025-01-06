import { type PropsWithChildren } from "react";
import { Button, buttonVariants } from "@repo/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/tooltip";
import { type VariantProps } from "class-variance-authority";
import { TriangleAlert } from "lucide-react";
import Link from "next/link";

import { Icons } from "../icons";

type GetStartedBtnProps = PropsWithChildren<{
  className?: string;
}> &
  VariantProps<typeof buttonVariants>;

export const GetStartedBtn = ({ ...props }: GetStartedBtnProps) => {
  const isMaintenance = process.env.APP_MAINTENANCE === "true";

  if (isMaintenance) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger className="cursor-not-allowed" asChild>
            <span tabIndex={0}>
              <Button
                className={props.className}
                aria-label="Get Started"
                data-testid="get-started-btn"
                disabled
                {...props}
              >
                <Icons.spotify />
                {props.children}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="py-3">
            <div className="flex gap-3">
              <TriangleAlert
                className="mt-0.5 shrink-0 opacity-60 text-red-400 dark:text-red-600"
                size={16}
                strokeWidth={2}
                aria-hidden="true"
              />
              <div className="space-y-1">
                <p className="text-[13px] font-medium">
                  Application is under maintenance
                </p>
                <p className="text-xs text-muted-foreground">
                  Please try again later.
                </p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      className={props.className}
      aria-label="Get Started"
      data-testid="get-started-btn"
      asChild
      {...props}
    >
      <Link href="/overview">
        <Icons.spotify />
        {props.children}
      </Link>
    </Button>
  );
};

/*
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="sm">
            W/ icon
          </Button>
        </TooltipTrigger>
        <TooltipContent className="dark py-3">
          <div className="flex gap-3">
            <Globe
              className="mt-0.5 shrink-0 opacity-60"
              size={16}
              strokeWidth={2}
              aria-hidden="true"
            />
            <div className="space-y-1">
              <p className="text-[13px] font-medium">Tooltip with title and icon</p>
              <p className="text-xs text-muted-foreground">
                Tooltips are made to be highly customizable, with features like dynamic placement,
                rich content, and a robust API.
              </p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
*/
