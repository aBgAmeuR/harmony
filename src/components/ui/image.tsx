import { cn } from "@/lib/utils"
import NextImage from 'next/image'

const sizes = {
  sm: {
    px: 48,
    size: 'size-12'
  },
  md: {
    px: 128,
    size: 'size-32'
  },
  lg: {
    px: 160,
    size: 'size-40'
  }
}

const variants = {
  rounded: 'rounded-sm',
  circle: 'rounded-full',
  square: 'rounded-none'
}

type ImageProps = {
  alt: string
  url: string
  size: 'sm' | 'md' | 'lg'
  variant?: 'rounded' | 'circle' | 'square'
  className?: string
}

export const Image = ({ alt, url, size, variant = 'rounded', className }: ImageProps) => {
  return (
    <div className={cn('flex justify-center items-center overflow-hidden', sizes[size].size, variants[variant], className)}>
      <NextImage src={url} alt={alt} width={sizes[size].px} height={sizes[size].px} className='min-h-full' quality={80} />
    </div>
  )
}
