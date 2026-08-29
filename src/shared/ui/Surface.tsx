import type { ReactNode } from 'react'

type Level = 'flow' | 'ruled' | 'panel' | 'feature'

const CLASS: Record<Level, string> = {
  flow: '',
  ruled: 'border-t border-line',
  panel: 'surface-panel',
  feature: 'surface-feature',
}

const PAD: Record<Level, string> = {
  flow: '',
  ruled: 'pt-4',
  panel: 'p-4',
  feature: 'p-5',
}

interface SurfaceProps {
  level: Level
  className?: string
  padded?: boolean
  children: ReactNode
}

export function Surface({ level, className = '', padded = true, children }: SurfaceProps) {
  const pad = padded ? PAD[level] : ''
  return <div className={`${CLASS[level]} ${pad} ${className}`.trim()}>{children}</div>
}

interface SectionProps {
  title?: string
  aside?: ReactNode
  className?: string
  children: ReactNode
}

export function Section({ title, aside, className = '', children }: SectionProps) {
  return (
    <section className={`flex flex-col gap-3 ${className}`.trim()}>
      {(title || aside) && (
        <header className="flex items-baseline justify-between gap-4">
          {title && <h2 className="text-[16px] font-semibold text-ink">{title}</h2>}
          {aside && <div className="text-[12px] text-ink-3">{aside}</div>}
        </header>
      )}
      {children}
    </section>
  )
}
