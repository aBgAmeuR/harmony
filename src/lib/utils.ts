import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const chunkSet = <T>(set: Set<T>, chunkSize: number): Array<Set<T>> => {
  const chunks: Array<Set<T>> = [];
  let currentChunk = new Set<T>();
  let count = 0;

  for (const item of set) {
    currentChunk.add(item);
    count++;

    if (count === chunkSize) {
      chunks.push(currentChunk);
      currentChunk = new Set<T>();
      count = 0;
    }
  }

  if (currentChunk.size > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
};
