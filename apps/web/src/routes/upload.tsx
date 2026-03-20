import { createFileRoute } from '@tanstack/react-router'
import { UploadWizard } from '@/components/upload/upload-wizard'

export const Route = createFileRoute('/upload')({
  ssr: false,
  component: UploadWizard,
})
