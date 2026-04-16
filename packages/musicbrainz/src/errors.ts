/**
 * Thrown when a MusicBrainz `ws/2` HTTP response is not successful (after redirects).
 */
export class MusicBrainzApiError extends Error {
  readonly name = 'MusicBrainzApiError'

  constructor(
    readonly status: number,
    readonly body: string
  ) {
    super(`MusicBrainz API error ${status}: ${body}`)
  }
}
