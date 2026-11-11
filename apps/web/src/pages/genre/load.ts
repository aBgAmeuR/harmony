import type { QueryClient } from "@tanstack/react-query";

import { loadItem } from "@/widgets/item/api";

export const loadGenre = (queryClient: QueryClient, genre: string) =>
  loadItem(queryClient, { kind: "genre", id: genre });
