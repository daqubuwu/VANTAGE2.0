import type { ComponentType } from 'react'
import type { Hero, Match } from '@/shared/api/types'
import { buildMatchFacts } from './facts'
import type { MatchFactKind } from './facts'
import { EmptyState } from '@/shared/ui/States'
import {
  ListMagnifyingGlass,
  Drop,
  Crown,
  Coins,
  Target,
  Buildings,
  Skull,
  TrendUp,
  ArrowUUpLeft,
} from '@phosphor-icons/react'

interface MatchFactsProps {
  match: Match
  heroes: Map<number, Hero> | undefined
}

const FACT_ICON: Record<MatchFactKind, ComponentType<{ size?: number; className?: string }>> = {
  firstblood: Drop,
  kda: Crown,
  networth: Coins,
  damage: Target,
  towers: Buildings,
  roshan: Skull,
  lane: TrendUp,
  comeback: ArrowUUpLeft,
}

export function MatchFacts({ match, heroes }: MatchFactsProps) {
  const facts = buildMatchFacts(match, heroes)

  if (facts.length === 0) {
    return (
      <EmptyState
        icon={<ListMagnifyingGlass size={28} />}
        title="Фактов не набралось"
        hint="Не хватает данных матча для правил разбора."
      />
    )
  }

  return (
    <ul className="flex flex-col divide-y divide-line">
      {facts.map((fact, i) => {
        const Icon = FACT_ICON[fact.kind]
        return (
          <li key={i} className="flex items-center gap-2.5 py-2.5 text-[13px] text-ink-2">
            <Icon
              size={16}
              className={`shrink-0 ${
                fact.tone === 'win' ? 'text-win' : fact.tone === 'loss' ? 'text-loss' : 'text-ink-3'
              }`}
            />
            {fact.text}
          </li>
        )
      })}
    </ul>
  )
}
