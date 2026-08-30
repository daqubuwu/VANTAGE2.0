import { Link } from 'react-router-dom'
import type { Hero, PlayerMatch } from '@/shared/api/types'
import { isRadiantSlot } from '@/shared/api/types'
import { HeroIcon } from '@/shared/ui/HeroIcon'
import { ago, compact, dec, duration, kda, num } from '@/shared/lib/format'
import { Tooltip } from '@/shared/ui/Tooltip'
import type { MatchPosition } from './matchPositions'

const GAME_MODE: Record<number, string> = {
  1: 'Все случайные',
  2: 'Только выбор',
  3: 'Случайный выбор',
  4: 'Одиночный',
  5: 'Общий выбор',
  16: 'Капитанский',
  22: 'Ранкед',
  23: 'Турбо',
}

interface MatchRowProps {
  match: PlayerMatch
  hero: Hero | undefined
  position?: MatchPosition
}

export function MatchRow({ match, hero, position }: MatchRowProps) {
  const radiant = isRadiantSlot(match.player_slot)
  const win = match.radiant_win === null ? null : match.radiant_win === radiant
  const ratio = kda(match.kills, match.deaths, match.assists)
  const parsed = match.version !== null

  return (
    <Link
      to={`/match/${match.match_id}`}
      className="group grid grid-cols-[3px_minmax(0,1fr)_auto] items-center gap-3 rounded-block px-3 py-2.5 transition-colors hover:bg-surface-2 md:grid-cols-[3px_minmax(0,1fr)_112px_72px_72px_92px] md:gap-4"
    >
      <span
        aria-hidden
        className="h-9 w-[3px] shrink-0 rounded-full"
        style={{
          background:
            win === null
              ? 'var(--color-ink-3)'
              : win
                ? 'var(--color-win)'
                : 'var(--color-loss)',
        }}
      />

      <span className="flex min-w-0 items-center gap-3">
        <span className="relative shrink-0">
          <HeroIcon hero={hero} size={30} link={false} />
          {position && (
            <Tooltip content={position.label} variant="hint">
              <span className="num absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-line bg-surface text-[9px] font-semibold text-ink-2">
                {position.number ?? '?'}
              </span>
            </Tooltip>
          )}
        </span>
        <span className="flex min-w-0 flex-col">
          <span className="truncate text-[14px] text-ink">{hero?.localized_name ?? '—'}</span>
          <span className="truncate text-[11px] text-ink-3">
            {GAME_MODE[match.game_mode] ?? 'Матч'} · {ago(match.start_time)}
          </span>
        </span>
      </span>

      <span className="hidden text-right md:block">
        <span className="num text-[13px] text-ink">
          {match.kills}/{match.deaths}/{match.assists}
        </span>
        <span className="block text-[11px] text-ink-3">KDA {dec(ratio, 2)}</span>
      </span>

      <span className="hidden text-right md:block">
        <span className="num text-[13px] text-gold">{num(match.gold_per_min)}</span>
        <span className="block text-[11px] text-ink-3">GPM</span>
      </span>

      <span className="hidden text-right md:block">
        <span className="num text-[13px] text-dmg">{compact(match.hero_damage)}</span>
        <span className="block text-[11px] text-ink-3">урон</span>
      </span>

      <span className="flex items-center justify-end gap-2">
        <span className="num text-[13px] text-ink-2">{duration(match.duration)}</span>
        <span className="flex w-3 justify-center">
          {!parsed && (
            <Tooltip content="Матч не распарсен: подробных данных нет" variant="hint">
              <span className="h-1.5 w-1.5 rounded-full bg-warm" aria-label="не распарсен" />
            </Tooltip>
          )}
        </span>
      </span>
    </Link>
  )
}
