import { Card } from "@harmony/ui/components/card";

export const Empty = ({ children }: { children: string }) => (
  <Card size="sm" className="items-center justify-center py-10 text-muted-foreground">
    {children}
  </Card>
);
