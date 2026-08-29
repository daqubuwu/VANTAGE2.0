import type { Match } from '@/shared/api/types'
import { ago, duration, num } from '@/shared/lib/format'
import { ExportControls } from './ExportControls'
import type { RefObject } from 'react'

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

interface MatchHeaderProps {
  match: Match
  exportRef: RefObject<HTMLElement | null>
}

export function MatchHeader({ match, exportRef }: MatchHeaderProps) {
  const parsed = match.version !== null

  return (
    <div className="surface-feature flex flex-wrap items-center gap-5 px-5 py-4">
      <div className="flex items-center gap-3">
        <ScoreBadge tone="radiant" score={match.radiant_score} won={match.radiant_win} label="Radiant" />
        <span className="text-[13px] text-ink-3">:</span>
        <ScoreBadge tone="dire" score={match.dire_score} won={!match.radiant_win} label="Dire" />
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="num text-[13px] text-ink">{duration(match.duration)}</span>
        <span className="text-[11px] text-ink-3">
          {GAME_MODE[match.game_mode] ?? 'Матч'} · {ago(match.start_time)}
        </span>
      </div>

      <span
        className={`rounded-full px-2.5 py-1 text-[11px] ${
          parsed ? 'bg-accent/12 text-accent' : 'bg-warm/12 text-warm'
        }`}
      >
        {parsed ? 'Разобран' : 'Не разобран'}
      </span>

      <span className="num text-[12px] text-ink-3">ID {num(match.match_id)}</span>

      <div className="ml-auto">
        <ExportControls targetRef={exportRef} fileName={`vantage-match-${match.match_id}`} />
      </div>
    </div>
  )
}

function ScoreBadge({
  tone,
  score,
  won,
  label,
}: {
  tone: 'radiant' | 'dire'
  score: number
  won: boolean
  label: string
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ background: tone === 'radiant' ? 'var(--color-radiant)' : 'var(--color-dire)' }}
        aria-hidden
      />
      <span className="text-[12px] text-ink-3">{label}</span>
      <span className={`num text-[18px] font-semibold ${won ? 'text-ink' : 'text-ink-3'}`}>{score}</span>
    </div>
  )
}
