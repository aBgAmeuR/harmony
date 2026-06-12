import { createServerFn } from '@tanstack/react-start'
import { client } from '@/lib/api'

export type PackageView = {
  id: string
  fileName: string
  fileSize: number
  status: string
  createdAt: string
}

export const getPackageById = createServerFn({ method: 'GET' })
  .inputValidator((input: { packageId: string }) => input)
  .handler(async ({ data }) => {
    try {
      const pkg = await client.api.package.package.show({
        params: { id: data.packageId },
      })

      return {
        found: true as const,
        pkg: {
          id: pkg.id,
          fileName: pkg.fileName,
          fileSize: pkg.fileSize,
          status: pkg.status,
          createdAt: pkg.createdAt.toString(),
        },
      }
    } catch {
      return { found: false as const }
    }
  })
