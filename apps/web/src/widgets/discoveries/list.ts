export const listTitles = {
  passed: "Passed through",
  release: "Heard at release",
  back: "Back after a break",
} as const;

export type DiscoveryList = keyof typeof listTitles;

const isList = (value: unknown): value is DiscoveryList =>
  typeof value === "string" && Object.hasOwn(listTitles, value);

export const parseDiscoveriesSearch = (raw: Record<string, unknown>): { list?: DiscoveryList } =>
  isList(raw.list) ? { list: raw.list } : {};
