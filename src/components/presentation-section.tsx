import { Image } from "@/components/ui/image"
import { Title } from "@mantine/core"
import { SpotifyBtn } from "@/components/ui/spotify-btn"

type PresentationSectionProps = {
  name: string
  image_url: string
  href: string
  image_rounded?: 'rounded' | 'circle' | 'square'
}

export const PresentationSection = ({ name, image_url, href, image_rounded }: PresentationSectionProps) => {
  return (
    <section className="bg-secondary">
      <div className="px-4 py-8 mx-auto w-full max-w-4xl flex gap-4 items-center justify-between">
        <div className="flex gap-4 items-center">
          <Image alt={name} url={image_url} size='lg' variant={image_rounded} />
          <Title order={1}>{name}</Title>
        </div>
        <SpotifyBtn href={href} />
      </div>
    </section>
  )
}
