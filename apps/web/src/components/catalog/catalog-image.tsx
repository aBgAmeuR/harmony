import { Avatar, AvatarFallback, AvatarImage } from '@harmony/ui/components/avatar'
import { HugeiconsIcon } from '@hugeicons/react'
import { MusicNote03Icon } from '@hugeicons/core-free-icons'

type CatalogImageProps = {
  image: string | undefined | null
  alt: string
}
export const CatalogImage = ({ image, alt }: CatalogImageProps) => {
  return (
    <Avatar className="size-8 rounded-md">
      <AvatarImage src={image ?? undefined} alt={alt} className="rounded-sm" />
      <AvatarFallback className="rounded-md text-[10px]">
        <HugeiconsIcon icon={MusicNote03Icon} strokeWidth={1} className="size-3" />
      </AvatarFallback>
    </Avatar>
  )
}
