"use client";

import React from "react";
import { Badge } from "@repo/ui/badge";
import { useSession } from "next-auth/react";

export const DemoBadge = () => {
  const { data: session } = useSession();

  if (session?.user?.name !== "Demo") return;

  return <Badge>Demo</Badge>;
};
