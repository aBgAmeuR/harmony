import { Link, useMatchRoute } from "@tanstack/react-router";

import type { NavLinkAdapter } from "./types/link-adapter";

function toRelative(href: string): string {
  if (href === "/") return ".";
  if (href.startsWith("/")) return `.${href}`;
  return href;
}

export function useAppLinkAdapter(): NavLinkAdapter {
  const matchRoute = useMatchRoute();

  return {
    render: (item) => {
      if (item.external) return <a href={item.href} target="_blank" rel="noopener noreferrer" />;

      const to = toRelative(item.href);
      const exact = item.href === "/";

      return <Link from="/app/$packageId" to={to} preload="intent" activeOptions={{ exact }} />;
    },
    isActive: (item) => {
      if (item.external) return false;

      const to = toRelative(item.href);
      const exact = item.href === "/";

      return Boolean(
        matchRoute({
          from: "/app/$packageId",
          to,
          fuzzy: !exact,
          includeSearch: false,
        }),
      );
    },
  };
}
