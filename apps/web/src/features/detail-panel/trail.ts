const KINDS = ["artist", "album", "track", "genre"] as const;

export type Detail =
  | { kind: "artist" | "album" | "track"; id: number }
  | { kind: "genre"; id: string };

const escape = (id: string) => id.replaceAll("%", "%25").replaceAll(".", "%2E");
const unescape = (raw: string) => raw.replaceAll("%2E", ".").replaceAll("%25", "%");

const parseOne = (part: string): Detail[] => {
  const cut = part.indexOf("-");
  const kind = KINDS.find((known) => known === part.slice(0, cut));
  const raw = part.slice(cut + 1);
  if (kind === "genre") return raw ? [{ kind, id: unescape(raw) }] : [];
  const id = Number(raw);
  return kind && Number.isInteger(id) && id > 0 ? [{ kind, id }] : [];
};

export const parseTrail = (value: unknown) =>
  typeof value === "string" ? value.split(".").flatMap(parseOne) : [];

export const formatTrail = (trail: Detail[]) =>
  trail.length > 0
    ? trail.map(({ kind, id }) => `${kind}-${typeof id === "string" ? escape(id) : id}`).join(".")
    : undefined;

export const parseDetailSearch = (raw: Record<string, unknown>): { detail?: string } => ({
  detail: formatTrail(parseTrail(raw.detail)),
});
