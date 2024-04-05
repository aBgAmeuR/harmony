import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  server: {
    SPOTIFY_CLIENT_ID: z.string(),
    SPOTIFY_CLIENT_SECRET: z.string(),
    NODE_ENV: z.string().optional(),
  },
  client: {},
  experimental__runtimeEnv: {},
})
