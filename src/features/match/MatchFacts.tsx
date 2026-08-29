import type { Hero, Match } from '@/shared/api/types'
import { buildMatchFacts } from './facts'
import { EmptyState } from '@/shared/ui/States'
import { ListMagnifyingGlass } from '@phosphor-icons/react'

interface MatchFactsProps {
  match: Match
  heroes: Map<number, Hero> | undefined
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
      {facts.map((fact, i) => (
        <li key={i} className="py-2.5 text-[13px] text-ink-2">
          {fact.text}
        </li>
      ))}
    </ul>
  )
}
