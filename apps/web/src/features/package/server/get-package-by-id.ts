import { createServerFn } from '@tanstack/react-start'

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
    const res = await fetch(
      `${process.env.VITE_API_URL || 'http://localhost:3333'}/api/v1/package/${data.packageId}`
    )

    if (res.status === 404) {
      return { found: false as const }
    }

    if (!res.ok) {
      throw new Error(`Failed to fetch package: ${res.status}`)
    }

    const pkg = (await res.json()) as PackageView
    return { found: true as const, pkg }
  })
