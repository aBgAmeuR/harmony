export type HeroEntityKind = "Track" | "Artist" | "Album";

export type HeroEntityCard = {
  kind: HeroEntityKind;
  name: string;
  subtitle?: string;
  rank?: number;
  image: string;
  metric?: number;
  positionClassName: string;
  rotateClassName: string;
};

/** Dense static series (~3× keyframes) with mild crypto-style tick noise. */
export const HERO_CHART_VALUES: readonly number[] = [
  178, 181, 178, 184, 178, 178, 180, 183, 185, 182, 187, 181, 189, 187, 190, 187, 180, 189, 184,
  186, 181, 184, 185, 188, 194, 190, 192, 188, 198, 197, 190, 192, 189, 192, 191, 192, 192, 188,
  192, 195, 198, 192, 196, 198, 193, 198, 194, 199, 193, 193, 197, 192, 193, 192, 197, 189, 195,
  197, 197, 197, 192, 202, 197, 198, 196, 193, 191, 191, 197, 190, 188, 186, 193, 194, 187, 191,
  186, 187, 191, 190, 188, 180, 185, 186, 185, 179, 179, 180, 175, 183, 178, 179, 176, 177, 183,
  175, 177, 172, 173, 165, 168, 168, 163, 161, 151, 154, 150, 152, 156, 149, 149, 149, 151, 145,
  141, 142, 145, 150, 142, 140, 131, 134, 145, 145, 147, 142, 147, 151, 152, 153, 147, 149, 144,
  152, 145, 142, 140, 135, 141, 139, 147, 148, 148, 146, 145, 148, 146, 153, 147, 151, 150, 147,
  150, 145, 149, 151, 155, 152, 145, 141, 137, 138, 130, 123, 113, 102, 110, 106, 111, 109, 114,
  125, 142, 161, 171, 172, 165, 169, 171, 173, 178, 166, 170, 159, 146, 131, 120, 122, 120, 122,
  116, 116, 112, 119, 121, 115, 120, 118, 119, 118, 117, 120, 116, 120, 123, 127, 125, 128, 139,
  141, 157, 156, 161, 156, 153, 162, 158, 159, 153, 154, 162, 180, 197, 194, 196, 193, 201, 194,
  187, 184, 178, 177, 174, 176, 168, 163, 164, 166, 168, 161, 167, 165, 162, 166, 161, 162, 154,
  159, 162, 159, 160, 161, 166, 154, 159, 155, 155, 154, 150, 162, 159, 167, 167, 167, 165, 169,
  174, 168, 170, 167, 175, 176, 175, 180, 174, 178, 183, 184, 179, 173, 179, 182, 185, 179, 180,
  178, 176, 184, 178, 179, 175, 178, 183, 179, 182, 178, 182, 181, 90,
];

export const HERO_CHART_DATA: ReadonlyArray<{ i: number; value: number }> = HERO_CHART_VALUES.map(
  (value, i) => ({ i, value }),
);

/** Cards sit inside the framed chart stage. Position vs rotation split for float/hover. */
export const HERO_ENTITY_CARDS: readonly HeroEntityCard[] = [
  {
    kind: "Track",
    name: "FE!N",
    subtitle: "Travis Scott, Playboi Carti",
    metric: 1190,
    positionClassName: "left-[4%] top-[20%]",
    rotateClassName: "rotate-[6deg]",
    image:
      "https://cdn-images.dzcdn.net/images/cover/6c91e64b7157f1332a4f6b0de9e4c714/56x56-000000-80-0-0.jpg",
  },
  {
    kind: "Artist",
    name: "Playboi Carti",
    subtitle: "67,957 min",
    metric: 67957,
    rank: 1,
    positionClassName: "left-[0%] top-[50%]",
    rotateClassName: "-rotate-[4deg]",
    image:
      "https://cdn-images.dzcdn.net/images/artist/b90097972a60d9d8598a79a786be1a3a/56x56-000000-80-0-0.jpg",
  },
  {
    kind: "Album",
    name: "Whole Lotta Red",
    subtitle: "Playboi Carti",
    metric: 23319,
    positionClassName: "right-[0%] top-[30%]",
    rotateClassName: "-rotate-[4deg]",
    image:
      "https://cdn-images.dzcdn.net/images/cover/3c5f5f3f5f41ff96f961afd7df7eb4d9/56x56-000000-80-0-0.jpg",
  },
  {
    kind: "Track",
    name: "Let It Go",
    subtitle: "Playboi Carti",
    metric: 939,
    positionClassName: "right-[8%] top-[60%]",
    rotateClassName: "rotate-[4deg]",
    image:
      "https://cdn-images.dzcdn.net/images/cover/0ae8e05f734268cbe5aae06f96f2b1f2/56x56-000000-80-0-0.jpg",
  },
];

export const DEMO_PACKAGE_ID = "667IkR";

export const GITHUB_REPO_URL = "https://github.com/aBgAmeuR/Harmony";
export const DOCUMENTATION_URL = `${GITHUB_REPO_URL}#readme`;
export const CHANGELOG_URL = `${GITHUB_REPO_URL}/releases`;
