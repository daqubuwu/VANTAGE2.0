import { useMemo, useState } from 'react'
import { useHeroes, useHeroStats, useHeroMatchupsBatch, useHeroDurationsBatch } from '@/shared/api/queries'
import { useDocumentTitle } from '@/shared/lib/useDocumentTitle'
import { Section } from '@/shared/ui/Surface'
import { SkeletonRows } from '@/shared/ui/Skeleton'
import { ErrorState } from '@/shared/ui/States'
import { DraftBoard } from '@/features/draft/DraftBoard'
import { HeroPicker } from '@/features/draft/HeroPicker'
import { CounterPanel } from '@/features/draft/CounterPanel'
import { BanSuggestions } from '@/features/draft/BanSuggestions'
import { BestPickPanel } from '@/features/draft/BestPickPanel'
import { TimingWindows } from '@/features/draft/TimingWindows'
import { suggestCounters } from '@/features/draft/counters'
import { suggestBestPicks } from '@/features/draft/bestPick'
import { buildTimingRows } from '@/features/draft/timing'
import { assign, remove, EMPTY_DRAFT } from '@/features/draft/state'
import type { DraftMode } from '@/features/draft/state'
import { BracketFilter } from '@/features/meta/BracketFilter'
import { buildTierRows } from '@/features/meta/tierlist'
import type { BracketKey } from '@/features/meta/tierlist'

const BAN_LIMIT_OPTIONS: { key: string; label: string; value: number | null }[] = [
  { key: 'none', label: 'Без лимита', value: null },
  { key: 'ten', label: '10 на матч', value: 10 },
  { key: 'six', label: '6 на матч', value: 6 },
]

export function DraftPage() {
  useDocumentTitle('Драфт')

  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [mode, setMode] = useState<DraftMode>('radiant')
  const [bracket, setBracket] = useState<BracketKey>('pro')
  const [banLimitKey, setBanLimitKey] = useState('none')

  const heroes = useHeroes()
  const heroStats = useHeroStats()

  const pickedIds = [...draft.radiant, ...draft.dire]
  const matchups = useHeroMatchupsBatch(pickedIds)
  const durations = useHeroDurationsBatch(pickedIds)

  const takenIds = useMemo(() => new Set([...draft.radiant, ...draft.dire, ...draft.bans]), [draft])
  const banLimit = BAN_LIMIT_OPTIONS.find((option) => option.key === banLimitKey)?.value ?? null

  const radiantCounters = useMemo(
    () => suggestCounters(draft.dire, matchups.data, takenIds, heroes.data),
    [draft.dire, matchups.data, takenIds, heroes.data],
  )
  const direCounters = useMemo(
    () => suggestCounters(draft.radiant, matchups.data, takenIds, heroes.data),
    [draft.radiant, matchups.data, takenIds, heroes.data],
  )

  const tierRows = useMemo(() => buildTierRows(heroStats.data, bracket), [heroStats.data, bracket])

  const radiantBestPicks = useMemo(
    () => suggestBestPicks(draft.radiant, draft.dire, matchups.data, tierRows, takenIds, heroes.data),
    [draft.radiant, draft.dire, matchups.data, tierRows, takenIds, heroes.data],
  )
  const direBestPicks = useMemo(
    () => suggestBestPicks(draft.dire, draft.radiant, matchups.data, tierRows, takenIds, heroes.data),
    [draft.dire, draft.radiant, matchups.data, tierRows, takenIds, heroes.data],
  )

  const timingRows = useMemo(
    () => buildTimingRows(draft.radiant, draft.dire, durations.data),
    [draft.radiant, draft.dire, durations.data],
  )

  function handleRemove(slotMode: DraftMode, heroId: number) {
    setDraft((prev) => remove(prev, slotMode, heroId))
  }

  function handleAssign(slotMode: DraftMode, heroId: number) {
    setDraft((prev) => assign(prev, slotMode, heroId, banLimit))
  }

  return (
    <div className="flex flex-col gap-8">
      <Section title="Драфт-борд">
        <DraftBoard radiant={draft.radiant} dire={draft.dire} bans={draft.bans} heroes={heroes.data} onRemove={handleRemove} />
      </Section>

      <Section title="Выбор героя">
        <ModeSwitch mode={mode} onChange={setMode} />
        {heroes.isPending ? (
          <SkeletonRows rows={3} height={40} />
        ) : heroes.isError ? (
          <ErrorState
            message={heroes.error instanceof Error ? heroes.error.message : 'Неизвестная ошибка'}
            onRetry={() => void heroes.refetch()}
          />
        ) : (
          <HeroPicker
            heroes={heroes.data}
            takenIds={takenIds}
            onPick={(heroId) => handleAssign(mode, heroId)}
          />
        )}
      </Section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Лучший пик для Radiant" aside="контрпик + мета + недостающая роль в команде">
          <BestPickPanel rows={radiantBestPicks} heroes={heroes.data} onPick={(heroId) => handleAssign('radiant', heroId)} />
        </Section>
        <Section title="Лучший пик для Dire" aside="контрпик + мета + недостающая роль в команде">
          <BestPickPanel rows={direBestPicks} heroes={heroes.data} onPick={(heroId) => handleAssign('dire', heroId)} />
        </Section>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section title="Контрпики для Radiant" aside="средний винрейт врага против героя">
          <CounterPanel
            title="Против пиков Dire"
            rows={radiantCounters}
            heroes={heroes.data}
            onPick={(heroId) => handleAssign('radiant', heroId)}
          />
        </Section>
        <Section title="Контрпики для Dire" aside="средний винрейт врага против героя">
          <CounterPanel
            title="Против пиков Radiant"
            rows={direCounters}
            heroes={heroes.data}
            onPick={(heroId) => handleAssign('dire', heroId)}
          />
        </Section>
      </div>

      <Section title="Кого банить">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BracketFilter value={bracket} onChange={setBracket} />
          <label className="flex items-center gap-2 text-[12px] text-ink-3">
            Лимит банов
            <select
              value={banLimitKey}
              onChange={(event) => setBanLimitKey(event.target.value)}
              className="h-8 rounded-full border border-line-2 bg-surface px-3 text-[12px] text-ink focus:border-accent/50 focus:outline-none"
            >
              {BAN_LIMIT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="text-[11px] text-ink-3">
          {draft.bans.length}
          {banLimit !== null && ` / ${banLimit}`} забанено · лимит банов отличается по режиму и патчу, поэтому
          выставляется вручную, а не зашит в код
        </p>
        {heroStats.isPending ? (
          <SkeletonRows rows={5} height={40} />
        ) : heroStats.isError ? (
          <ErrorState
            message={heroStats.error instanceof Error ? heroStats.error.message : 'Неизвестная ошибка'}
            onRetry={() => void heroStats.refetch()}
          />
        ) : (
          <BanSuggestions
            tierRows={tierRows}
            excludeIds={takenIds}
            heroes={heroes.data}
            onPick={(heroId) => handleAssign('ban', heroId)}
          />
        )}
      </Section>

      <Section title="Timing windows" aside="среднее по /durations выбранных героев, не прогноз матча">
        <TimingWindows rows={timingRows} />
      </Section>
    </div>
  )
}

const MODE_OPTIONS: { key: DraftMode; label: string }[] = [
  { key: 'radiant', label: 'Radiant' },
  { key: 'dire', label: 'Dire' },
  { key: 'ban', label: 'Бан' },
]

function ModeSwitch({ mode, onChange }: { mode: DraftMode; onChange: (mode: DraftMode) => void }) {
  return (
    <div role="tablist" aria-label="Режим выбора" className="mb-3 flex w-fit gap-1 rounded-full border border-line-2 bg-surface p-1">
      {MODE_OPTIONS.map((option) => {
        const active = option.key === mode
        return (
          <button
            key={option.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.key)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors active:translate-y-px ${
              active ? 'bg-accent font-medium text-[#04171a]' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
