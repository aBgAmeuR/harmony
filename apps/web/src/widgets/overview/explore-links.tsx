import { Award01Icon, Compass01Icon, Icon, UserGroup02Icon } from "@harmony/icons";
import { buttonVariants } from "@harmony/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { format } from "@/shared/lib/format";
import { Section } from "@/shared/primitives/section";

import { overviewQueries } from "./api";
import { useRanges } from "./use-range";

export const ExploreLinks = () => {
  const { range, full } = useRanges();
  const { data } = useQuery(overviewQueries.kpis({ range, full }));
  const artists = data?.current.totals.artists ?? 0;

  const links = [
    {
      to: "./explorer",
      search: { base: "artists" },
      icon: UserGroup02Icon,
      label: artists > 0 ? `Browse all ${format.count(artists)} artists` : "Browse your artists",
    },
    { to: "./discoveries", search: {}, icon: Compass01Icon, label: "See what you discovered" },
    { to: "./milestones", search: {}, icon: Award01Icon, label: "Look back at your milestones" },
  ] as const;

  return (
    <Section size="sm">
      <Section.Title>Keep exploring</Section.Title>
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <Link
            key={link.to}
            from="/app/$packageId"
            to={link.to}
            search={link.search}
            preload="intent"
            className={buttonVariants({ variant: "outline" })}
          >
            <Icon icon={link.icon} />
            {link.label}
          </Link>
        ))}
      </div>
    </Section>
  );
};
