// The files of a Spotify export the server reads. Keep in sync with
// `apps/server/crates/pipeline/src/read/extract.rs`.
const HISTORY_FILE =
  /Spotify Extended Streaming History\/Streaming_History_Audio_(\d{4}(-\d{4})?)(?:_(\d+))?\.json/;

// As the server reads ZIP entry names: forward slashes, no leading `./` or `/`.
export const normalizePath = (path: string): string =>
  path
    .replace(/\\/g, "/")
    .replace(/^(\.\/)+/, "")
    .replace(/^\/+/, "");

export const isHistoryFile = (path: string): boolean => HISTORY_FILE.test(normalizePath(path));
