import React, { PropsWithChildren } from "react";
import { Card } from "@repo/ui/card";
import { NumberFlow } from "@repo/ui/number";
import { Progress } from "@repo/ui/progress";

type Header = {
  label: string;
  value: string | number;
  percentage?: boolean;
};

type ProgressCardProps = PropsWithChildren<{
  progress: number;
  description: string | React.ReactNode;
}>;

export const ProgressCard = ({
  progress,
  description,
  children,
}: ProgressCardProps) => {
  return (
    <Card className="p-6">
      <div className="flex justify-between mb-4">{children}</div>
      <Progress
        value={progress}
        className="h-2 [&>div]:duration-500 [&>div]:ease-in-out"
      />
      <p className="text-sm text-muted-foreground mt-2">{description}</p>
    </Card>
  );
};

export const ProgressCardHeader = ({ label, value, percentage }: Header) => {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <h3 className="text-2xl font-semibold">
        <NumberFlow
          value={value}
          format={{
            notation: "standard",
            style: percentage ? "percent" : "decimal",
          }}
          locales="en-US"
        />
      </h3>
    </div>
  );
};
