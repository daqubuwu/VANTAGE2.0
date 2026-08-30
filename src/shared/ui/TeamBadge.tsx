function initials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)
  const first = words[0]
  const second = words[1]
  if (!first) return '?'
  if (!second) return first.slice(0, 2).toUpperCase()
  return `${first[0] ?? ''}${second[0] ?? ''}`.toUpperCase() || '?'
}

interface TeamBadgeProps {
  name: string | null
  size?: number
}

export function TeamBadge({ name, size = 26 }: TeamBadgeProps) {
  const label = name ?? '?'

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-ctl bg-surface-2 text-[11px] font-semibold text-ink-2"
      style={{ width: size, height: size }}
    >
      {initials(label)}
    </span>
  )
}
