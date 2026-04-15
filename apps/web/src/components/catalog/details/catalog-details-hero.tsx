import { CatalogImage } from '../catalog-image'

type CatalogDetailsHeroProps = {
  image: string | null
  name: string
  description: string
}

export const CatalogDetailsHero = ({ image, name, description }: CatalogDetailsHeroProps) => {
  return (
    <div className="flex items-center gap-2 px-4 mb-4">
      <CatalogImage image={image} alt={name} className="size-16" />
      <div className="min-w-0">
        <h3 className="text-md font-semibold">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
