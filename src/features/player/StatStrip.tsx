import type { StripCell } from '@/shared/ui/Stat'
import { Stat } from '@/shared/ui/Stat'

export type { StripCell }

export function StatStrip({ cells }: { cells: StripCell[] }) {
  return (
    <div className="flex flex-wrap gap-x-9 gap-y-4">
      {cells.map((cell) => (
        <Stat key={cell.label} {...cell} />
      ))}
    </div>
  )
}
