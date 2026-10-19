// The `track` search param opens the Track Details panel, on every page that can show one.
export const parseTrack = (value: unknown): number | undefined => {
  const id = typeof value === "string" ? Number(value) : value;
  return typeof id === "number" && Number.isInteger(id) && id > 0 ? id : undefined;
};
