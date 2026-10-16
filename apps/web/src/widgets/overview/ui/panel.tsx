import type { ComponentProps, ReactNode } from "react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@harmony/ui/components/card";
import { cn } from "@harmony/ui/lib/utils";

type PanelProps = Omit<ComponentProps<typeof Card>, "title"> & {
  title: string;
  action?: ReactNode;
};

export const Panel = ({ title, action, className, children, ...props }: PanelProps) => (
  <Card className={cn("h-full gap-3", className)} {...props}>
    <CardHeader>
      <CardTitle className="text-foreground">{title}</CardTitle>
      {action ? <CardAction className="text-muted-foreground">{action}</CardAction> : null}
    </CardHeader>
    <CardContent className="flex flex-1 flex-col">{children}</CardContent>
  </Card>
);
