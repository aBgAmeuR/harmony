/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  eventStream: typeof routes['event_stream']
  subscribe: typeof routes['subscribe']
  unsubscribe: typeof routes['unsubscribe']
  auth: {
    newAccount: {
      store: typeof routes['auth.new_account.store']
    }
    accessToken: {
      store: typeof routes['auth.access_token.store']
      destroy: typeof routes['auth.access_token.destroy']
    }
  }
  profile: {
    profile: {
      show: typeof routes['profile.profile.show']
    }
  }
  uploads: {
    uploads: {
      upload: typeof routes['uploads.uploads.upload']
      stats: typeof routes['uploads.uploads.stats']
    }
  }
  package: {
    package: {
      show: typeof routes['package.package.show']
      stats: typeof routes['package.package.stats']
      destroy: typeof routes['package.package.destroy']
    }
    tracks: {
      top: typeof routes['package.tracks.top']
      get: typeof routes['package.tracks.get']
    }
    albums: {
      top: typeof routes['package.albums.top']
    }
  }
}
