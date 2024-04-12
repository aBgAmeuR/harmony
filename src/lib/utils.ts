import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getHref(uri: string, type: "artists" | "albums" | "tracks") {
  const id = uri.split(":")[2]
  return `/ranking/${type}/${id}`
}
