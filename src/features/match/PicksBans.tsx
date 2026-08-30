import type { Hero, Match } from '@/shared/api/types'
import { buildDraftOrder } from './draftOrder'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { EmptyState } from '@/shared/ui/States'
import { Prohibit, ListNumbers } from '@phosphor-icons/react'

interface PicksBansProps {
  match: Match
  heroes: Map<number, Hero> | undefined
}

export function PicksBans({ match, heroes }: PicksBansProps) {
  const entries = buildDraftOrder(match)

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={<ListNumbers size={28} />}
        title="Нет данных о пиках и банах"
        hint="OpenDota не отдал очерёдность драфта для этого матча - обычно так бывает в обычных лобби без капитанского режима."
      />
    )
  }

  const radiant = entries.filter((entry) => entry.radiant)
  const dire = entries.filter((entry) => !entry.radiant)

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <PicksBansColumn entries={radiant} heroes={heroes} tone="radiant" />
      <PicksBansColumn entries={dire} heroes={heroes} tone="dire" />
    </div>
  )
}

interface PicksBansColumnProps {
  entries: ReturnType<typeof buildDraftOrder>
  heroes: Map<number, Hero> | undefined
  tone: 'radiant' | 'dire'
}

function PicksBansColumn({ entries, heroes, tone }: PicksBansColumnProps) {
  const picks = entries.filter((entry) => entry.isPick)
  const bans = entries.filter((entry) => !entry.isPick)

  return (
    <div className="flex flex-col gap-3">
      <span className="flex items-center gap-2 text-[12px] text-ink-2">
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: tone === 'radiant' ? 'var(--color-radiant)' : 'var(--color-dire)' }}
          aria-hidden
        />
        {tone === 'radiant' ? 'Radiant' : 'Dire'}
      </span>

      {picks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {picks.map((entry, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <HeroIcon hero={heroes?.get(entry.heroId)} size={30} link={false} />
              <span className="num text-[10px] text-ink-3">#{entry.order + 1}</span>
            </div>
          ))}
        </div>
      )}

      {bans.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="flex items-center gap-1 text-[11px] text-ink-3">
            <Prohibit size={12} />
            баны
          </span>
          <div className="flex flex-wrap gap-2">
            {bans.map((entry, i) => (
              <div key={i} className="relative flex flex-col items-center gap-1 opacity-60">
                <span className="relative">
                  <HeroIcon hero={heroes?.get(entry.heroId)} size={26} link={false} />
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Prohibit size={16} weight="fill" className="text-loss" />
                  </span>
                </span>
                <span className="num text-[10px] text-ink-3">#{entry.order + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
