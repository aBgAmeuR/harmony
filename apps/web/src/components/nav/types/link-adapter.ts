import { ReactElement } from "react";

import { NavItem } from "./nav-item";

export type NavLinkAdapter = {
  render: (item: NavItem) => ReactElement;
  isActive: (item: NavItem) => boolean;
};
