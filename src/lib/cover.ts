"use server";

// https://musicbrainz.org/ws/2/release-group/?query=album:Whole Lotta Red&artist=Playboi Carti&fmt=json&limit=1
//
type ImageQuality = "250" | "500" | "1200" | undefined | null;

export const getCoverUrl = async (
  album: string,
  artist: string,
  quality: ImageQuality = "250"
) => {
  console.log("album", album);

  const res = await fetch(
    `https://musicbrainz.org/ws/2/release-group/?query=album:${album}&artist=${artist}&fmt=json&limit=1`,
    {
      headers: {
        "User-Agent": "harmony/2.0.0 (antoine.josset35@gmail.com)"
      }
    }
  );
  if (!res.ok) {
    return;
  }
  const data = await res.json();
  console.log(`data ${album} :`, data);

  const releaseGroup = data["release-groups"][0];
  if (!releaseGroup) {
    return;
  }
  const coverArt = releaseGroup["cover-art-archive"];
  if (!coverArt) {
    return;
  }
  if (coverArt.front) {
    return `https://coverartarchive.org/release-group/${releaseGroup.id}/front-${quality}`;
  }
};
