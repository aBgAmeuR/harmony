import { Suspense } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/card";
import { Skeleton } from "@repo/ui/skeleton";

interface StatCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  description,
  children,
  className,
}: StatCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<Skeleton className="h-[250px] w-full" />}>
          {children}
        </Suspense>
      </CardContent>
    </Card>
  );
}
