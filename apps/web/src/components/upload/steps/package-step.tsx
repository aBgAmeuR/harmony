import { useRef, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  Cancel01Icon,
  FolderUploadIcon,
  Zip01Icon,
} from '@hugeicons/core-free-icons'
import { Button } from '@harmony/ui/components/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@harmony/ui/components/card'
import { cn } from '@harmony/ui/lib/utils'

interface PackageStepProps {
  packageFile: File | null
  onPackageSelect: (file: File | null) => void
  onContinue: () => void
}

const MAX_ZIP_SIZE = 50 * 1024 * 1024

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb / 1024
  return `${mb.toFixed(1)} MB`
}

function isZipFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.zip')
}

export function PackageStep({ packageFile, onPackageSelect, onContinue }: PackageStepProps) {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const validateAndSetFile = (file: File | null) => {
    if (!file) return
    if (!isZipFile(file)) {
      setError('Please upload a .zip file.')
      return
    }
    if (file.size > MAX_ZIP_SIZE) {
      setError('File is too large. Maximum allowed size is 50 MB.')
      return
    }
    setError(null)
    onPackageSelect(file)
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setError(null)
    onPackageSelect(null)
  }

  const handleOpenPicker = () => {
    inputRef.current?.click()
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    validateAndSetFile(file)
    e.currentTarget.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0] ?? null
    validateAndSetFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload your package</CardTitle>
        <CardDescription>
          Select or drag and drop your{' '}
          <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">.zip</span> file to get
          started.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3">
        <Button
          type="button"
          variant="ghost"
          onClick={handleOpenPicker}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative group flex flex-col items-center justify-center gap-3 rounded-lg',
            'h-44 w-full transition-colors cursor-pointer outline-none',
            'ring-1 ring-border/50 bg-background/50 hover:bg-background/30',
            isDragOver && 'bg-background/30 ring-primary/50',
            'after:absolute after:inset-1 after:rounded-md',
            'after:border after:border-dashed after:border-border/50',
            'hover:after:border-border/80 after:pointer-events-none after:transition-colors',
            isDragOver && 'after:border-primary/60',
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".zip,application/zip"
            onChange={handleInputChange}
            className="hidden"
          />
          <div className="grid place-items-center size-8 rounded-md ring-1 ring-border/50 bg-muted text-muted-foreground group-hover:text-foreground group-hover:bg-background transition-all">
            <HugeiconsIcon icon={FolderUploadIcon} size={16} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              Drag & drop or{' '}
              <span className="underline decoration-[0.5px] underline-offset-2">
                click to upload
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supports <span className="font-mono">.zip</span> files up to 50 MB
            </p>
          </div>
        </Button>

        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : null}

        {packageFile && (
          <div className="flex items-center gap-3 rounded-lg border px-3 py-2">
            <div className="flex items-center justify-center size-9 rounded-md ring-1 ring-border/50 bg-background">
              <HugeiconsIcon icon={Zip01Icon} className="size-5 text-primary" />
            </div>
            <div className="me-auto min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{packageFile.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {formatBytes(packageFile.size)}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={handleRemove}
                aria-label="Remove package"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-end">
        <Button onClick={onContinue} disabled={!packageFile} size="sm">
          Continue
        </Button>
      </CardFooter>
    </Card>
  )
}
