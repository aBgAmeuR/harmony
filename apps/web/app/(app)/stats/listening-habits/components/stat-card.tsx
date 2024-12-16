import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { cn } from "@repo/ui/lib/utils";
import { Skeleton } from "@repo/ui/skeleton";

interface StatCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  skeletonClassName?: string;
  className?: string;
}

export function StatCard({
  title,
  description,
  children,
  className,
  skeletonClassName,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense
          fallback={<Skeleton className={cn("w-full", skeletonClassName)} />}
        >
          {children}
        </Suspense>
      </CardContent>
    </Card>
  );
}
