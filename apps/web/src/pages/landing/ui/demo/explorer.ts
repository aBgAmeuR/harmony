type DemoRow = { id: number; name: string; image: string; playtime: number; rank: number };

const artist = (id: number, name: string, playtime: number, rank: number) => ({
  id,
  name,
  image: `/landing/covers/artist-${id}.webp`,
  playtime,
  rank,
});

export const TOP_ARTISTS: DemoRow[] = [
  artist(2568121, "Ken Carson", 5119, 1),
  artist(10002824, "Playboi Carti", 4964, 2),
  artist(121652122, "SLAYR", 4303, 3),
  artist(7101343, "Lil Uzi Vert", 4084, 4),
];
