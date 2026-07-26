import { IconSvgElement } from "@harmony/icons";

export type NavItem = {
  title: string;
  href: string;
  icon?: IconSvgElement;
  external?: boolean;
};