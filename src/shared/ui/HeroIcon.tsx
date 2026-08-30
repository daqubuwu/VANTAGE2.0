import { Link } from 'react-router-dom'
import { heroImage, heroIcon } from '@/shared/api/images'
import type { Hero } from '@/shared/api/types'
import { Tooltip } from './Tooltip'

interface HeroIconProps {
  hero: Hero | undefined
  size?: number
  variant?: 'wide' | 'square'
  link?: boolean
}

export function HeroIcon({ hero, size = 32, variant = 'wide', link = true }: HeroIconProps) {
  const width = variant === 'wide' ? Math.round(size * 1.78) : size
  const src = hero ? (variant === 'wide' ? heroImage(hero.name) : heroIcon(hero.name)) : undefined

  const image = (
    <span
      className="block shrink-0 overflow-hidden rounded-ctl bg-surface-2"
      style={{ width, height: size }}
    >
      {src && (
        <img
          src={src}
          alt={hero?.localized_name ?? ''}
          width={width}
          height={size}
          loading="lazy"
          crossOrigin="anonymous"
          className="h-full w-full object-cover"
        />
      )}
    </span>
  )

  if (!hero) return image

  const wrapped = link ? (
    <Link to={`/heroes/${hero.id}`} aria-label={hero.localized_name}>
      {image}
    </Link>
  ) : (
    image
  )

  return (
    <Tooltip content={hero.localized_name} variant="hint">
      {wrapped}
    </Tooltip>
  )
}
