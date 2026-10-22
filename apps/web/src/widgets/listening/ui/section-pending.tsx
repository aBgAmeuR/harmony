import type { ReactNode } from "react";

import { Skeleton } from "@harmony/ui/components/skeleton";

import { Section } from "@/shared/primitives/section";

type SectionPendingProps = {
  title: string;
  // Blocks shaped like the loaded content, so the page keeps its height.
  children: ReactNode;
};

// A section while its data loads: its title, a line for its sentence, then its blocks.
export const SectionPending = ({ title, children }: SectionPendingProps) => (
  <Section size="md">
    <Section.Title>{title}</Section.Title>
    <Skeleton className="h-5 w-3/4" />
    <div className="mt-3 flex flex-col gap-3">{children}</div>
  </Section>
);
