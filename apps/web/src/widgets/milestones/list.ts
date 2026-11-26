export const parseMilestonesSearch = (raw: Record<string, unknown>): { list?: "period" } =>
  raw.list === "period" ? { list: "period" } : {};
