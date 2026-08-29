interface SkeletonProps {
  className?: string
}

export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={`rounded-ctl bg-surface-2 ${className}`}
      style={{
        backgroundImage:
          'linear-gradient(100deg, transparent 20%, rgba(255,255,255,.05) 40%, transparent 60%)',
        backgroundSize: '220% 100%',
        animation: 'vantage-shimmer 1.6s var(--ease-out-expo) infinite',
      }}
    />
  )
}

export function SkeletonRows({ rows = 6, height = 44 }: { rows?: number; height?: number }) {
  return (
    <div className="flex flex-col gap-1.5">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className={`w-full rounded-block`} />
      )).map((node, i) => (
        <div key={i} style={{ height }}>
          {node}
        </div>
      ))}
    </div>
  )
}
