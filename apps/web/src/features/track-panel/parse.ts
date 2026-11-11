export const parseTrack = (value: unknown) => {
  const id = typeof value === "string" ? Number(value) : value;
  return typeof id === "number" && Number.isInteger(id) && id > 0 ? id : undefined;
};
