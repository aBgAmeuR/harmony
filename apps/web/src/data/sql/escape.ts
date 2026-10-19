export const escapeLiteral = (value: string): string => value.replaceAll("'", "''");

// For a `LIKE ... ESCAPE '\'` pattern: the wildcards of the search term lose their meaning.
export const escapeLike = (value: string): string =>
  escapeLiteral(value).replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
