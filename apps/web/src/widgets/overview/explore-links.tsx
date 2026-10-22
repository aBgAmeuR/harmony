import { Award01Icon, Compass01Icon, Icon, UserGroup02Icon } from "@harmony/icons";
import { buttonVariants } from "@harmony/ui/components/button";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Section } from "@/shared/primitives/section";
import { format } from "@/utils/format";

import { overviewQueries } from "./api";
import { useRanges } from "./use-range";

// Where to go after the summary.
export const ExploreLinks = () => {
  const { range, full } = useRanges();
  const { data } = useQuery(overviewQueries.kpis.queryOptions(range, full));
  const artists = data?.current.totals.artists ?? 0;

  const links = [
    {
      to: "./artists",
      icon: UserGroup02Icon,
      label: artists > 0 ? `Browse all ${format.count(artists)} artists` : "Browse your artists",
    },
    { to: "./discoveries", icon: Compass01Icon, label: "See what you discovered" },
    { to: "./milestones", icon: Award01Icon, label: "Look back at your milestones" },
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
