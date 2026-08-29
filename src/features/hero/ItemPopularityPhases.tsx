import type { PhaseGroup } from './itemPopularity'
import { itemImage } from '@/shared/api/images'
import { Tooltip } from '@/shared/ui/Tooltip'
import { EmptyState } from '@/shared/ui/States'
import { num } from '@/shared/lib/format'

interface ItemPopularityPhasesProps {
  phases: PhaseGroup[]
}

export function ItemPopularityPhases({ phases }: ItemPopularityPhasesProps) {
  const hasAny = phases.some((phase) => phase.items.length > 0)

  if (!hasAny) {
    return (
      <EmptyState
        title="Нет данных по предметам"
        hint="OpenDota пока не отдал статистику по фазам для этого героя."
      />
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {phases.map((phase) => (
        <div key={phase.key} className="surface-panel flex flex-col gap-2.5">
          <span className="text-[12px] font-medium text-ink-2">{phase.label}</span>
          {phase.items.length === 0 ? (
            <span className="text-[12px] text-ink-3">нет данных</span>
          ) : (
            <div className="flex flex-col gap-1.5">
              {phase.items.map((item) => (
                <Tooltip key={item.itemId} variant="entity" content={item.meta.dname}>
                  <div className="flex items-center gap-2">
                    <span className="block h-6 w-9 shrink-0 overflow-hidden rounded-[4px] bg-surface-2">
                      <img
                        src={itemImage(item.meta.key)}
                        alt={item.meta.dname}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </span>
                    <span className="truncate text-[12px] text-ink-2">{item.meta.dname}</span>
                    <span className="num ml-auto shrink-0 text-[11px] text-ink-3">{num(item.count)}</span>
                  </div>
                </Tooltip>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
