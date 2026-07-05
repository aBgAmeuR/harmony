export function toSqlDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function interactionDateConditions(from: Date, to: Date): string[] {
  return [
    `CAST(i.ts AS DATE) >= DATE '${toSqlDate(from)}'`,
    `CAST(i.ts AS DATE) <= DATE '${toSqlDate(to)}'`,
  ];
}

export function joinWhere(conditions: string[]): string {
  return conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
}
