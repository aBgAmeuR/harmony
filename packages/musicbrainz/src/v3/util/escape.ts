export function escapeLucene(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}
