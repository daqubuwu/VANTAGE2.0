import { useMemo } from 'react'
import { usePlayerRoleMatches } from '@/shared/api/queries'
import { aggregateByRole, ROLES } from './roles'
import type { RoleKey } from './roles'
import { Skeleton } from '@/shared/ui/Skeleton'
import { EmptyState, ErrorState } from '@/shared/ui/States'
import { Tooltip, MathTooltip } from '@/shared/ui/Tooltip'
import { compact, dec, num, pct } from '@/shared/lib/format'
import { WifiSlash } from '@phosphor-icons/react'

interface RoleSplitProps {
  accountId: number | undefined
  days: number | null
  stratzOk: boolean
}

export function RoleSplit({ accountId, days, stratzOk }: RoleSplitProps) {
  const roleMatches = usePlayerRoleMatches(accountId, days, stratzOk)
  const byRole = useMemo(() => aggregateByRole(roleMatches.data ?? []), [roleMatches.data])

  if (!stratzOk) {
    return (
      <EmptyState
        icon={<WifiSlash size={28} />}
        title="Нужен доступ к Stratz"
        hint="Роль на матче знает только Stratz. Пока индикатор в шапке показывает «недоступен», раздел не считается - приблизительных цифр без источника не показываем."
      />
    )
  }

  if (roleMatches.isPending) {
    return (
      <div className="flex flex-col gap-1.5">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[52px] w-full rounded-block" />
        ))}
      </div>
    )
  }

  if (roleMatches.isError) {
    return (
      <ErrorState
        message={roleMatches.error instanceof Error ? roleMatches.error.message : 'Неизвестная ошибка'}
        onRetry={() => void roleMatches.refetch()}
      />
    )
  }

  const totalGames = Object.values(byRole).reduce((sum, agg) => sum + agg.games, 0)
  if (totalGames === 0) {
    return <EmptyState title="Нет матчей с определённой ролью за период" hint="Stratz не размечает часть игр." />
  }

  return (
    <div className="flex flex-col divide-y divide-line">
      {ROLES.map(({ key, label }) => (
        <RoleRow key={key} label={label} roleKey={key} agg={byRole[key]} />
      ))}
    </div>
  )
}

interface RoleRowProps {
  label: string
  roleKey: RoleKey
  agg: ReturnType<typeof aggregateByRole>[RoleKey]
}

function RoleRow({ label, agg }: RoleRowProps) {
  if (agg.games === 0) {
    return (
      <div className="flex items-center justify-between gap-4 py-3">
        <span className="text-[13px] text-ink-2">{label}</span>
        <span className="text-[12px] text-ink-3">нет матчей за период</span>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
      <span className="min-w-[110px] text-[13px] text-ink">{label}</span>
      <span className="text-[12px] text-ink-3">
        {num(agg.games)} {agg.games === 1 ? 'матч' : 'матчей'}
      </span>

      <RoleCell
        label="WR"
        value={pct(agg.winrate, 0)}
        tone={(agg.winrate ?? 0) >= 0.5 ? 'text-win' : 'text-loss'}
        formula="побед / матчей с исходом на этой роли"
        note={`Побед: ${agg.wins} из ${agg.games}.`}
      />
      <RoleCell label="KDA" value={dec(agg.avgKda, 2)} formula="(убийства + помощи) / смерти, среднее на роли" />
      <RoleCell label="GPM" value={num(agg.avgGpm)} tone="text-gold" formula="среднее золото в минуту на роли" note="Источник: Stratz." />
      <RoleCell label="XPM" value={num(agg.avgXpm)} tone="text-xp" formula="средний опыт в минуту на роли" note="Источник: Stratz." />
      <RoleCell label="Урон" value={compact(agg.avgHeroDamage)} tone="text-dmg" formula="средний урон по героям за матч на роли" note="Источник: Stratz." />
    </div>
  )
}

interface RoleCellProps {
  label: string
  value: string
  tone?: string
  formula: string
  note?: string
}

function RoleCell({ label, value, tone = 'text-ink', formula, note }: RoleCellProps) {
  return (
    <Tooltip variant="math" content={<MathTooltip formula={formula} inputs={[]} note={note} />}>
      <span className="flex w-fit cursor-help items-baseline gap-1.5 border-b border-dashed border-line-2 pb-0.5">
        <span className="text-[11px] text-ink-3">{label}</span>
        <span className={`num text-[13px] font-medium ${tone}`}>{value}</span>
      </span>
    </Tooltip>
  )
}
