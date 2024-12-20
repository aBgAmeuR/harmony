import React from "react";
import { auth } from "@repo/auth";
import { Badge } from "@repo/ui/badge";

export const DemoBadge = async () => {
  const session = await auth();

  if (session?.user?.name !== "Demo") return;

  return <Badge className="hidden min-[432px]:block">Demo</Badge>;
};
